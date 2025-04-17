const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function joinZoomMeeting({ meetId, meetPassCode, joineeName }) {
  const cleanMeetId = meetId.replace(/\s/g, '');
  const zoomUrl = `https://app.zoom.us/wc/${cleanMeetId}/join`;

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-notifications",
      "--use-fake-ui-for-media-stream",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ],
    defaultViewport: null,
  });

  const [page] = await browser.pages();
  await page.goto(zoomUrl, { waitUntil: "networkidle2", timeout: 60000 }); 

  try {
    await page.waitForSelector('#input-for-pwd', { timeout: 15000 });
    await page.type('#input-for-pwd', meetPassCode);
    await page.type('#input-for-name', joineeName);
    console.log("✅ Entered name and passcode");

    await new Promise(resolve => setTimeout(resolve, 7000));

    await page.waitForSelector('button.preview-join-button', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('button.preview-join-button');
      if (btn && !btn.disabled) btn.click();
    });
    console.log("✅ Clicked final 'Join' to enter the meeting");

    await page.waitForSelector('#preview-video-control-button', { timeout: 15000 });
    await page.click('#preview-video-control-button');
    console.log("🎥 Toggled camera");

    await page.waitForSelector('#preview-audio-control-button', { timeout: 15000 });
    await page.click('#preview-audio-control-button');
    console.log("🎙️ Toggled mic");

    await page.waitForTimeout(10000);
    console.log("🎉 Bot should now be inside the Zoom meeting!");

  } catch (err) {
    console.error("❌ Error during join process:", err.message);
  }

  return browser;
}

module.exports = joinZoomMeeting;
