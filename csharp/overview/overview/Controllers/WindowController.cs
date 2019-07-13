using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.JSInterop;

namespace overview.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class WindowController : ControllerBase
    {
        internal static bool IsAltTabWindow(IntPtr windowHandle)
        {
            if (!WindowsFunctions.IsWindowVisible(windowHandle))
                return false;

            const int GA_ROOTOWNER = 3;
            var hwndTry = WindowsFunctions.GetAncestor(windowHandle, GA_ROOTOWNER);

            var hwndWalk = IntPtr.Zero;

            while (hwndTry != hwndWalk)
            {
                hwndWalk = hwndTry;
                hwndTry = WindowsFunctions.GetLastActivePopup(hwndWalk);
                if (WindowsFunctions.IsWindowVisible(hwndTry))
                    break;
            }

            if (hwndWalk != windowHandle)
                return false;

            // the following removes some task tray programs and "Program Manager"
            var titleBarInfo = new WindowsFunctions.TITLEBARINFO();
            titleBarInfo.cbSize = Marshal.SizeOf(titleBarInfo);
            WindowsFunctions.GetTitleBarInfo(windowHandle, ref titleBarInfo);

            const int STATE_SYSTEM_INVISIBLE = 0x00008000;

            if ((titleBarInfo.rgstate[0] & STATE_SYSTEM_INVISIBLE) != 0)
                return false;


            // Tool windows should not be displayed either, these do not appear in the
            // task bar.
            const int GWL_EXSTYLE = -20;
            const long WS_EX_TOOLWINDOW = 0x00000080L;
            if ((WindowsFunctions.GetWindowLong(windowHandle, GWL_EXSTYLE) & WS_EX_TOOLWINDOW) != 0)
            {
                return false;
            }

            WindowsFunctions.DwmGetWindowAttribute(windowHandle,
                WindowsFunctions.DWMWINDOWATTRIBUTE.Cloaked,
                out var isCloaked,
                Marshal.SizeOf(typeof(bool)));

            if (isCloaked)
            {
                return false;
            }

            return true;
        }

        public struct WindowInfo
        {
            public int WindowHandle;
            public string WindowTitle;
            public string ProcessFileLocation;
        }

        [HttpGet("windowInfos")]
        public ActionResult<IEnumerable<WindowInfo>> GetWindowInfos()
        {
            var windowInfos = new List<WindowInfo>();

            WindowsFunctions.EnumWindows(((windowHandle, param) =>
            {
                if (!IsAltTabWindow(windowHandle))
                {
                    return true;
                }

                var stringBuilder = new StringBuilder(1024);
                WindowsFunctions.GetWindowText(windowHandle, stringBuilder, stringBuilder.MaxCapacity);

                if (stringBuilder.Length == 0)
                {
                    return true;
                }

                WindowsFunctions.GetWindowThreadProcessId(windowHandle, out var processId);
                var process = Process.GetProcessById((int)processId);

                try
                {
                    windowInfos.Add(new WindowInfo
                    {
                        WindowHandle = windowHandle.ToInt32(),
                        WindowTitle = stringBuilder.ToString(),
                        ProcessFileLocation = process.MainModule?.FileName,
                    });
                }
                catch
                {
                    Console.WriteLine($"Cannot get window info - processId: {processId}, windowHandle: {windowHandle}");
                }
                

                return true;
            }), IntPtr.Zero);

            return windowInfos;
        }

        public static Bitmap GetScreenShot(IntPtr windowHandle)
        {
            WindowsFunctions.GetWindowRect(new HandleRef(null, windowHandle), out var rc);

            var bmp = new Bitmap(rc.Right - rc.Left, rc.Bottom - rc.Top, PixelFormat.Format32bppArgb);
            var gfxBmp = Graphics.FromImage(bmp);
            IntPtr hdcBitmap;
            try
            {
                hdcBitmap = gfxBmp.GetHdc();
            }
            catch
            {
                return null;
            }

            var succeeded = WindowsFunctions.PrintWindow(windowHandle, hdcBitmap, 0x02); /// flag for hardware acceleration window.

            gfxBmp.ReleaseHdc(hdcBitmap);

            if (!succeeded)
            {
                gfxBmp.FillRectangle(new SolidBrush(Color.Gray), new Rectangle(Point.Empty, bmp.Size));
            }

            var hRgn = WindowsFunctions.CreateRectRgn(0, 0, 0, 0);
            WindowsFunctions.GetWindowRgn(windowHandle, hRgn);

            var region = Region.FromHrgn(hRgn); //err here once
            if (!region.IsEmpty(gfxBmp))
            {
                gfxBmp.ExcludeClip(region);
                gfxBmp.Clear(Color.Transparent);
            }

            gfxBmp.Dispose();
            return bmp;
        }

        [HttpGet("windowThumbnail")]
        public ActionResult<IEnumerable<int>> GetWindowThumbnail([FromQuery(Name = "windowHandle")] int windowHandle)
        {
            Console.WriteLine(windowHandle);
            using var memoryStream = new MemoryStream();

            var bitmap = GetScreenShot(new IntPtr(windowHandle));

            bitmap.Save(memoryStream, ImageFormat.Jpeg);

            var bitmapByteArray = memoryStream.ToArray();

            return File(bitmapByteArray, "image/jpeg");
        }

        public class MoveWindowRequestBody
        {
            public int WindowHandle { get; set; }
            public int X { get; set; }
            public int Y { get; set; }
            public int Width { get; set; }
            public int Height { get; set; }
        }

        [HttpPost("moveWindow")]
        public bool HandleMoveWindow(MoveWindowRequestBody body)
        {
            Console.WriteLine(body.WindowHandle);
            Console.WriteLine(body.X);
            Console.WriteLine(body.Y);
            Console.WriteLine(body.Width);
            Console.WriteLine(body.Height);
            return WindowsFunctions.MoveWindow(
                new IntPtr(body.WindowHandle),
                body.X,
                body.Y,
                body.Width,
                body.Height,
                false);
        }

        [HttpPost("setWindowAlwaysOnTop")]
        public int SetWindowAlwaysOnTop(int windowHandle)
        {
            Console.WriteLine(windowHandle);
            var isSuccessful = WindowsFunctions.SetWindowPos(
                new IntPtr(windowHandle),
                (IntPtr) WindowsFunctions.SpecialWindowHandles.HWND_TOPMOST,
                0,
                0,
                0,
                0,
                WindowsFunctions.SetWindowPosFlags.SWP_NOMOVE | WindowsFunctions.SetWindowPosFlags.SWP_NOSIZE
            );

            return !isSuccessful ? Marshal.GetLastWin32Error() : 0;
        }

        [HttpPost("stopWindowAlwaysOnTop")]
        public int StopWindowAlwaysOnTop(int windowHandle)
        {
            Console.WriteLine(windowHandle);
            var isSuccessful = WindowsFunctions.SetWindowPos(
                new IntPtr(windowHandle),
                (IntPtr)WindowsFunctions.SpecialWindowHandles.HWND_TOP,
                0,
                0,
                0,
                0,
                WindowsFunctions.SetWindowPosFlags.SWP_NOMOVE | WindowsFunctions.SetWindowPosFlags.SWP_NOSIZE
            );

            return !isSuccessful ? Marshal.GetLastWin32Error() : 0;
        }

        [HttpPost("showWindow")]
        public int ShowWindow(int windowHandle)
        {
            
            Console.WriteLine(windowHandle);
            var isSuccessful = WindowsFunctions.ShowWindow(
                new IntPtr(windowHandle),
                WindowsFunctions.ShowWindowCommand.SW_RESTORE
            );

            return !isSuccessful ? Marshal.GetLastWin32Error() : 0;
        }
    }
}