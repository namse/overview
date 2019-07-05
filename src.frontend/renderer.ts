import CameraFrame from "./CameraFrame";
import WebFrame from "./WebFrame";
import Frame from "./Frame/Frame";
import PdfFrameComponent from "./PdfFrameComponent";
import { remote } from 'electron';

const currentElectronWindow = remote.getCurrentWindow();

let isIgnoringMouseEvents : boolean = false;

function setMouseEventIgnore(willIgnore: boolean) {
  if (isIgnoringMouseEvents === willIgnore) {
    return;
  }

  isIgnoringMouseEvents = willIgnore;
  currentElectronWindow.setIgnoreMouseEvents(willIgnore, { forward: true });
}

function setMouseIgnoreEvent() {
  // setMouseEventIgnore(true);

  document.addEventListener('keydown', (event) => {
    console.log(event.key);
    if (event.key === 'ScrollLock') {
      console.log(!isIgnoringMouseEvents);
      setMouseEventIgnore(!isIgnoringMouseEvents);
    }
  });
}

async function test() {
  // WHAT I WANT TO DO
  // => DIV Only Frame


  // const divFrameComponent = new DivFrameComponent();
  // const sizeChangeFrameComponent = new SizeChangeFrameComponent();
  // const divFrame = new Frame(
  //   divFrameComponent,
  //   sizeChangeFrameComponent,
  // );

  // await divFrame.initialize();

  // const mainCameraDeviceId = 'bd87b13059e77e936d68944f10b4cea3cf2328ee4925fbc97940c97b8bf17322';
  // //481px
  // const mainCameraFrame = new CameraFrame({
  //   left: '1543px',
  //   top: '390px',
  //   width: '377px',
  //   height: '464px',
  //   cropInfo: {
  //     top: 0,
  //     right: 305,
  //     bottom: 55,
  //     left: 242,
  //   },
  //   // left: '0px',
  //   // top: '0px',
  //   // width: '1920px',
  //   // height: '1080px',
  //   deviceId: mainCameraDeviceId,
  //   isHorizontallyFlipped: true,
  //   isMuted: false,
  // });

  // await mainCameraFrame.initialize();

  // const chatFrame = new WebFrame(
  //   '1475px',
  //   '140px',
  //   '455px',
  //   '256px',
  //   'https://twip.kr/widgets/chatbox/P2b0Y97NZYb');

  // await chatFrame.initialize();

  // const typeSpeedMeterFrame = new WebFrame(
  //   '1354px',
  //   '765px',
  //   '168px',
  //   '281px',
  //   'http://localhost:58825');

  // await typeSpeedMeterFrame.initialize();

  const pdfFrameComponent =  new PdfFrameComponent(
    '0px',
    '0px',
    '960px',
    '540px',
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  );

  const pdfFrame = new Frame(pdfFrameComponent);

  await pdfFrame.initialize();

  // const rowSpeedMeterFrame = new WebFrame(
  //   '800px',
  //   '50px',
  //   '350px',
  //   '250px',
  //   'http://192.168.0.13:8080/');

  // await rowSpeedMeterFrame.initialize();
}

setMouseIgnoreEvent();
test().catch(err => console.error(err));
