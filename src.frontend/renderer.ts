import CameraFrame from "./CameraFrame";
import WebFrame from "./WebFrame";

async function test() {
  console.log(await navigator.mediaDevices.enumerateDevices());
  const mainCameraDeviceId = 'bd87b13059e77e936d68944f10b4cea3cf2328ee4925fbc97940c97b8bf17322';
  //481px
  const mainCameraFrame = new CameraFrame({
    left: '1543px',
    top: '390px',
    width: '377px',
    height: '464px',
    cropInfo: {
      top: 0,
      right: 305,
      bottom: 55,
      left: 242,
    },
    deviceId: mainCameraDeviceId,
    isHorizontallyFlipped: true,
    isMuted: false,
  });
  await mainCameraFrame.initialize();

  const chatFrame = new WebFrame(
    '1475px',
    '140px',
    '455px',
    '256px',
    'https://twip.kr/widgets/chatbox/P2b0Y97NZYb');

  await chatFrame.initialize();

  const typeSpeedMeterFrame = new WebFrame(
    '1354px',
    '765px',
    '168px',
    '281px',
    'http://localhost:58825');

  await typeSpeedMeterFrame.initialize();
}

test();
