# Handing off from the Flow film to the live page

1. The visible jump is about picture, not colour: the clip ends with dark water and flowers where the page is near-white, while colour decoding moves the sky by about 2 levels out of 255.
2. Best first move, with no credits: dissolve in two stages, sky first and water second, using two opacity animations in `intro.js` and `style.css`.
3. Likely phone bug to fix alongside it: `lake.play()` runs outside a tap, which WebKit's source denies in Low Power Mode, so those guests would skip the lake and his name.
4. If you still want more, generate one short bridge clip with start and end frames (lake's last frame tilting up to a page-sky plate); it costs 7 to 12 credits a try, and Flow lists 50 free credits a day.
5. Skip View Transitions, alpha video, scroll scrubbing, codec swaps, upscaling and any attempt at pixel-exact matching.

Researched 2026-11-02. Google help pages show only "©2026", so treat those as "read on this date". Effort figures and anything marked *my inference* are mine, not from a source. Reading pages went through a fetch tool that summarises, so short quotes are as relayed by it, except WebKit source, which I read directly.

## What is in the project today

Measured with ffprobe and ffmpeg on `public/assets/` (read-only; the extracted frame went to a temp folder).

| Fact | Lamp | Lake |
|---|---|---|
| Size and video bitrate | 1.0 MB, 1.02 Mbps | 1.85 MB, 1.87 Mbps |
| Frames and length | 190 frames, 7.917 s (not 8) | same |
| Keyframes | **1** (frame 0 only) | **1** (frame 0 only) |
| `moov` index position | byte 40, so already faststart | same |
| Tags | matrix `smpte170m`, transfer `iec61966-2-1`, primaries `bt709`, range `tv` | same |

Last frame of the lake against the page (average colour across each horizontal band of the frame):

| Band of the frame | Lake last frame | Page gradient near that height (`.sky-gradient`) |
|---|---|---|
| Very top | 111, 131, 153 | `#bcd5e6` = 188, 213, 230 (about 80 levels lighter) |
| Second eighth | 171, 180, 185 | about `#dbe3df` = 219, 227, 223 (about 45 levels lighter) |
| Third and fourth eighths, horizon and sun | 226, 225, 214 and 204, 189, 153 | between `#dbe3df` and `#f6e2c8`, so the nearest match |
| Very bottom | 58, 39, 29 | `#fff6e4` = 255, 246, 228 (about 200 levels lighter) |

The page also paints a sun and clouds over that gradient (`src/lib/heaven.js`), so real page pixels will differ a little.

Reading the code:

- The fade starts when `timeupdate` sees `t >= 6.4` and lasts 1.5 s (`intro.js:83`). That lands at about 7.9 s, right at the clip's end, so it barely ever shows a frozen frame. Timing is not the problem.
- The whole `.film` fades as one layer. Halfway through, dark water and flowers lie as a double exposure over the portrait and the heading. That is the jump a guest sees.
- The sky is the one part of the frame that already resembles the page, and the sun sits at a similar height (page `.sun` at `top: 40%`; the video sun at roughly 38%, though off-centre to the left).
- `Heaven.start()` and the portrait flower blooms wait until `finish()`, after the film is gone (`experience.js:63`, `style.css:264`).
- `<meta name="theme-color" content="#050403">` never changes after the film (`index.html:9`). See B7.

## A. What Flow and Veo offer

### Model and feature matrix (Flow)

From [Flow models and features](https://support.google.com/labs/answer/16352836?hl=en):

| Model | First + last frame | Ingredients | Extend | Lengths |
|---|---|---|---|---|
| Veo 3.1 Lite | Yes | Yes, 8 s only | Yes, 8 s clips only | 4, 6, 8 s |
| Veo 3.1 Fast | Yes | Yes, 8 s only | No | 4, 6, 8 s |
| Veo 3.1 Quality | Yes | No | No | 4, 6, 8 s |
| Gemini Omni Flash 1.1 | Yes, on the Flow web app only | Yes | "Coming soon" | 4, 6, 8, 10 s |

All four offer both aspect ratios, so 9:16 is available for start and end frames ([same page](https://support.google.com/labs/answer/16352836?hl=en)). The Gemini API's Veo 3.1 preview models shut down on 2026-10-22 and developers are pointed at Omni Flash ([Gemini API docs](https://ai.google.dev/gemini-api/docs/veo)), but that is the API; Flow's help still lists Veo 3.1 ([same models page](https://support.google.com/labs/answer/16352836?hl=en)).

### Credit costs

From [Manage your Flow credits](https://support.google.com/flow/answer/16526234?hl=en), which itself says limits may change; Flow tells you to check the prompt box for the live cost ([models page](https://support.google.com/labs/answer/16352836?hl=en)).

| Item | Credits per generation |
|---|---|
| Veo 3.1 Lite, 4/6/8 s or Extend | 10 (5 on Ultra) |
| Veo 3.1 Fast | 20 (10 on Ultra) |
| Veo 3.1 Quality, 8 s or Extend | 100 |
| Omni Flash 720p, 4/6/8/10 s | 7 / 10 / 12 / 15 |
| Omni Flash 360p, 4/6/8/10 s | 4 / 5 / 6 / 7 |
| Omni edit of an uploaded or generated video | 40 |
| Upscale to 1080p | 0 on Plus, Pro, Ultra; not available to non-subscribers |
| Upscale to 4K | 50, Ultra only |

**This matters for your budget.** The same page says all users, subscribed or not, get 50 credits a day, that unused daily credits do not roll over, and that the refresh is triggered by your first generation of the day ([credits page](https://support.google.com/flow/answer/16526234?hl=en)). So "few or no credits" may be only until tomorrow. Non-subscribers may be blocked during peak hours, roughly 2 PM to 5 PM UTC, which is 10 PM to 1 AM in Malaysia ([same page](https://support.google.com/flow/answer/16526234?hl=en)). I could not confirm that a free account can use frames with every model; the help only says all users can access Omni ([models page](https://support.google.com/labs/answer/16352836?hl=en)).

### Feature by feature

- **Frames to Video.** In the prompt box choose model name > Video > Frames, drag images into the start and end slots, and describe the transition ([Create videos](https://support.google.com/labs/answer/16353334?hl=en)). Google's post says it will "generate a seamless video that bridges the two" (Oct 2025, [Google blog](https://blog.google/innovation-and-ai/products/veo-updates-flow/)).
- **Does the last frame match exactly?** No source promises it. Vertex says only "Image to use as the last frame of the generated video" ([API reference](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/reference/rest/Shared.Types/VideoGenerationModelInstance)). The first-and-last-frames guide (updated 2026-10-30) covers neither exactness nor looping ([Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/generate-videos-from-first-and-last-frames)). Omni's guide says it "transitions smoothly" and is silent on exactness ([Omni docs](https://ai.google.dev/gemini-api/docs/omni)). *My inference:* output passes through a lossy encoder, so plan for close rather than identical, and always dissolve rather than hard cut.
- **Looping.** There is no documented loop feature in any page I read. Using one image for both slots is an obvious try but undocumented, and this project does not need a loop.
- **Extend.** In Flow you open a clip, click Extend and describe what continues; only Veo-generated videos qualify, and insert, remove and camera edits cannot then be applied ([Edit videos](https://support.google.com/flow/answer/16935718?hl=en)). Each extension is based on the final second of the previous clip ([Google blog](https://blog.google/innovation-and-ai/products/veo-updates-flow/)). All Veo 3.1 8 s clips can be extended, but only using Lite ([models page](https://support.google.com/labs/answer/16352836?hl=en)). The credits page prices Extend under Fast and Quality too, which conflicts; trust the prompt box. Extend continues motion but gives no control over the final frame. Whether your local files count as "Veo generated" after upload is unconfirmed, and the originals may need to be in the Flow project.
- **Scenebuilder.** Lines up clips, reorders, trims, previews and downloads a scene ([Edit videos](https://support.google.com/flow/answer/16935718?hl=en)). Google's mobile help lists it as desktop only ([Android version](https://support.google.com/flow/answer/16935718?co=GENIE.Platform%3DAndroid&hl=en)). It adds nothing here that a local join cannot do.
- **Jump To.** The only source is a June 2025 post saying it worked with Veo 2 only ([Google blog](https://blog.google/technology/ai/flow-video-tips/)). Current help does not mention it ([Edit videos](https://support.google.com/flow/answer/16935718?hl=en)). Treat as unconfirmed, and do not plan on it.
- **Ingredients and reference images.** They keep a character or object consistent between clips, added by drag, `@` mention or upload ([Create videos](https://support.google.com/labs/answer/16353334?hl=en)). They guide the look and say nothing about how a clip ends, so they are the wrong tool for a handoff.
- **Image generation for an end plate.** Flow offers Nano Banana Pro, 2.1 and 2 Lite, with 2 Lite described as the no-charge default ([models page](https://support.google.com/labs/answer/16352836?hl=en)). For this job you do not need it: a plate rendered from your own CSS gradient matches better and is free (*my inference*).
- **Saving and uploading.** The edit help mentions saving frames as images ([Edit videos](https://support.google.com/flow/answer/16935718?hl=en)). Uploads for editing can be up to 60 s and 1 GB in .mov, .mp4, .avi or .wmv ([same page](https://support.google.com/flow/answer/16935718?hl=en)). Certain image types may not be supported for frames ([Create videos](https://support.google.com/labs/answer/16353334?hl=en)). The Veo API accepts only JPEG and PNG for frames ([Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/generate-videos-from-first-and-last-frames)); Flow's own list is not published.
- **Resolution and download.** Flow downloads are GIF or video files, and a GIF comes as 270p ([Manage projects](https://support.google.com/flow/answer/16935308?hl=en)). Omni in Flow is 720p standard and 360p draft ([models page](https://support.google.com/labs/answer/16352836?hl=en)), and an Aug 2026 Google post describes drafting at 360p and exporting in 1080p or 4K ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/)). Your 720x1280 clips are enough for phones at these sizes (*my inference*).
- **API limits, for reference.** Veo clips are 24 fps and carry a SynthID watermark, and extension is limited to 720p ([Gemini API docs](https://ai.google.dev/gemini-api/docs/veo)). Omni API extension adds 3 to 10 s, up to 40 s total ([Omni docs](https://ai.google.dev/gemini-api/docs/omni)).

## B. Web techniques

**B1. Holding on the final frame.** A paused video shows the frame at its current position, and when stalled or seeking it shows the last frame rendered ([HTML spec](https://html.spec.whatwg.org/multipage/media.html)). At the end, the browser fires `timeupdate`, sets paused, fires `pause`, then fires `ended` ([HTML spec](https://html.spec.whatwg.org/multipage/media.html)). So letting the clip run out and leaving the element mounted gives you a free, colour-perfect plate. Do not seek to get there: this clip has one keyframe, so a seek near the end has to decode from frame 0 (*my inference* from standard H.264 behaviour; I did not find a primary source that states it), and browsers do not guarantee frame-accurate seeking ([web.dev](https://web.dev/articles/requestvideoframecallback-rvfc)). `fastSeek()` trades precision for speed, and is not Baseline ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/fastSeek)).

**B2. Exact still as background or poster.** Worth having only as a fallback when play fails. Swapping a playing video to a JPEG at the end risks a small colour step, and it solves nothing that B1 does not. `poster` is shown before data is available and while paused on the first frame ([HTML spec](https://html.spec.whatwg.org/multipage/media.html)), so a last-frame image is the wrong thing to put there. Your current posters are right: `lake-poster.jpg` matches frame 0 within 1 level per channel in my four-band check.

**B3. DOM crossfade.** Opacity and transform are the properties to animate, since they stay on the compositing stage ([web.dev, 2020](https://web.dev/articles/animations-guide)). `mask-image` is Baseline widely available since December 2023, but it animates only as a discrete type ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image)), so a soft wipe should be built from a fixed mask plus an opacity animation. That is the pattern used in recommendation 1.

**B4. Matching the page's first paint to the video.** You do not need to match the whole frame, only the region that stays visible longest. Match the sky, and let the water and flowers dissolve. See recommendations 1 and 3.

**B5. `requestVideoFrameCallback`.** It runs when a new frame reaches the compositor, and `mediaTime` gives that frame's timestamp ([MDN, Baseline 2024](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)). Support begins at Chrome 83, Firefox 132 and Safari 15.4, and it is best effort with no strict guarantees ([web.dev](https://web.dev/articles/requestvideoframecallback-rvfc)). `timeupdate` fires only when none has fired in the past 15 to 250 ms ([HTML spec](https://html.spec.whatwg.org/multipage/media.html)). For a 1.5 s dissolve, 250 ms of jitter is hardly visible, so rVFC is a small refinement. Use it with `timeupdate` as the fallback.

**B6. View Transitions.** `startViewTransition` is Baseline 2025, newly available since October 2025 ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition)), and WebKit added it in Safari 18 ([WebKit](https://webkit.org/blog/15443/news-from-wwdc24-webkit-in-safari-18-beta/)). The old state is a static screenshot and the new state is live ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)). Chrome's guide says a video "appears to freeze" in the old snapshot, and that the page is frozen during the update callback ([Chrome docs, 2024](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)). It would freeze your moving lake and need a fallback on older iPhones, and all it gives you is an opacity fade you already have.

**B7. Browser bars.** `theme-color` tints browser UI but is "Limited availability" ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color)). Safari 15 used it for the status bar on iOS ([WebKit](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/)). A WebKit bug report says Safari 26 dropped it and tints the bar from the html or body background instead ([WebKit bug 301756](https://bugs.webkit.org/show_bug.cgi?id=301756), status NEW, so not an official statement). Your CSS already switches the body background when the film ends, which covers that case. Add a one-line script update of the meta tag for Android Chrome, so a black bar does not stay above a pale sky.

**B8. Colour shifts.** BT.709 and sRGB share primaries ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/VideoColorSpace/primaries)), so differences come from matrix, range and transfer. Your files say the matrix is `smpte170m`, which is BT.601 NTSC ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/VideoColorSpace/matrix)), with an sRGB transfer tag. Decoding the last frame with BT.601 versus BT.709 moved the five bands I sampled by at most 2 levels per channel. Against the 80 to 200 level picture difference above, this is noise in a dissolve.

- Do not hand-match a CSS colour to a decoded frame to the last level. Dissolve, and it will not show.
- If you re-encode, keep the matrix tag true to the conversion, and compare before and after. Apple's archived note says video without an `nclc` tag is treated as SMPTE-C in QuickTime X ([TN2227](https://developer.apple.com/library/archive/technotes/tn2227/_index.html)), so stripping tags can change the picture.
- Chromium's tracker holds the relevant gamma discussions ([issue 41233478](https://issues.chromium.org/issues/41233478)), but they sit behind a sign-in. I only saw search snippets, so I make no claim about current Chrome or Safari gamma handling.
- To get true sampled values for recommendation 3, draw the paused video to a same-origin canvas on an iPhone and read the pixels (*my suggestion*; I did not run it).

**B9. Autoplay, Low Power Mode and in-app browsers.**

- Muted video may play without a gesture on iOS, and `playsinline` prevents fullscreen ([WebKit, 2016](https://webkit.org/blog/6784/new-video-policies-for-ios/)). Chrome says muted autoplay is always allowed ([Chrome](https://developer.chrome.com/blog/autoplay)). MDN says to show a manual play control if `play()` rejects ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)).
- **Low Power Mode.** WebKit turned off autoplay of silent video there in 2017 ([bug 168985](https://bugs.webkit.org/show_bug.cgi?id=168985)), and an engineer confirmed it is deliberate ([bug 219889](https://bugs.webkit.org/show_bug.cgi?id=219889)). The current source adds the restriction when Low Power Mode is on ([HTMLMediaElement.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/HTMLMediaElement.cpp)) and refuses `play()` unless a user gesture is being processed ([MediaElementSession.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/MediaElementSession.cpp)). The restriction is removed from an element after a gesture-driven load or play on it (same HTMLMediaElement source). Thermal mitigation has a matching rule.
- **What this means for `intro.js`** (*my inference, needs a real iPhone test*). The tap blesses `lamp` only. `lake.play()` runs later inside `timeupdate` (`intro.js:76`), with no gesture, so on Low Power Mode it would reject, and `leave(800)` drops the guest to the page before the lake or his name appear. If nobody taps, the 7 s auto-light fails the same way and the whole film is skipped (`intro.js:97`).
- **WhatsApp.** I found no WhatsApp documentation. Secondary reporting from October 2026 says an opt-in iPhone in-app browser is only in TestFlight, with limited in-app support for some business links ([9to5Mac](https://9to5mac.com/2026/10/19/whatsapp-may-soon-let-iphone-users-open-any-link-in-an-in-app-browser/), citing WABetaInfo). Android behaviour is unconfirmed. Embedded web views are the risk if one is used: WebKit's header sets `allowsInlineMediaPlayback` to NO by default on iPhone ([WKWebViewConfiguration.h](https://github.com/WebKit/WebKit/blob/main/Source/WebKit/UIProcess/API/Cocoa/WKWebViewConfiguration.h)), meaning native fullscreen, and Android's WebView requires a user gesture for media by default ([WebSettings](https://developer.android.com/reference/android/webkit/WebSettings)). In both cases a tap and your existing fallbacks are the defence, so test by sending the real link to yourself on each phone.

**B10. Preload, data and battery.** `preload` is a hint the browser may ignore ([HTML spec](https://html.spec.whatwg.org/multipage/media.html), [web.dev, 2017](https://web.dev/articles/fast-playback-with-preload)). That 2017 article says Chrome forces `metadata` on cellular and `none` under Data Saver, so check before relying on it. So the lake may not be buffered at 6.8 s. The poster covers that gap, which is why the current design is safe. `navigator.connection.saveData` can be read to skip video, but it has limited availability ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)). Your 2.9 MB of video is modest, and any Flow bridge clip should stay near that bitrate.

**B11. `prefers-reduced-motion`.** Your `index.html` already skips the film for these users. If you add a fake camera move, note MDN names scaling and panning large objects as vestibular triggers and offers a dissolve as the gentler alternative ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)). An opacity-only handoff is safest.

**B12. Alpha video.** HEVC with alpha works in Safari from iOS 13, encoded through Apple tools such as AVFoundation ([WWDC19](https://developer.apple.com/videos/play/wwdc2019/506/)). Chrome plays alpha in WebM VP8 and VP9 ([Chrome](https://developer.chrome.com/blog/alpha-transparency-in-chrome-video)), and Safari does not support VP9 alpha ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs)). So you would need two encodes, one from a Mac tool, when you work on Windows, to do what a CSS gradient over the clip already does.

**B13. Codecs and fast start.** H.264 is supported everywhere; Safari plays AV1 only with a hardware decoder, on iPhone 15 Pro, iPhone 16 and later ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs), [WebKit](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/)). Keep H.264. `-movflags faststart` moves the index to the start of the file ([FFmpeg](https://ffmpeg.org/ffmpeg-formats.html)), and yours already has it. Any new file must use it too.

**B14. Scroll-linked playback.** Would need a re-encode with a keyframe every few frames, since yours has one per clip, and exact seeks are not guaranteed ([web.dev](https://web.dev/articles/requestvideoframecallback-rvfc)). Chrome's scroll-driven animations article does not cover video at all ([Chrome](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)). A scrubbed film is also the wrong feel for a solemn opening.

## C. Ranked recommendation

| # | Approach | Flow credits | Effort | Phone risk | Files |
|---|---|---|---|---|---|
| 1 | Sky-first two-stage dissolve | None | 2 to 3 h | Low | `src/lib/intro.js`, `src/style.css` |
| 2 | Play reliability fixes | None | 1 h plus device tests | Low | `src/lib/intro.js`, `index.html` or `intro.js` for theme-color |
| 3 | Dawn sky layer that brightens into the page | None | 1 to 2 h | Low | `src/style.css`, `src/lib/heaven.js`, `src/lib/intro.js` |
| 4 | Generated bridge clip, lake up into sky | 7 to 12 per try | Half a day | Low to medium | `public/assets/`, `src/lib/intro.js` |
| 5 | Bake the sky dissolve into the MP4 | None | 2 h | Low | `public/assets/lake.mp4`, `src/lib/intro.js` |

**1. Sky-first dissolve (do this).** Add `<div class="film-sky">` above the clips and below the caption, with the same gradient as `.sky-gradient`, and a fixed mask opaque at the top and transparent by about 55% of the height, just under the horizon. Move the gradient into a shared CSS variable so the two cannot drift.

- At about `t = 5.2`, fade `.film-sky` from 0 to 1 over 1.4 s. The sky becomes the page's sky while the sun, water and caption stay.
- At about `t = 6.6`, fade `.film` out over 1.3 s. The top of the frame now shows almost no change, and only the water and flowers dissolve, so the portrait rises out of a clear sky rather than through dark water.
- The clip runs out and holds on its last frame at near-zero opacity (B1). Both stages animate opacity only.
- Optional: start the flower blooms and `Heaven.start()` when the second stage begins, not after `finish()`, so the page is already alive as it appears.
- Skip keeps its fast `leave(450)`.

**2. Reliability (do this too).** None of it changes the look on a normal phone.

- In `light(byTouch)`, when `byTouch` is true, unlock the second clip inside the tap: `lake.play().then(() => lake.pause())`, then let the timer call `play()` later. WebKit's source suggests this lifts the restriction (B9), but test it on an iPhone with Low Power Mode on, since I could not.
- Change `lake.play().catch(...)`: on failure, keep the lake poster, show the caption over it, then dissolve as normal, rather than dropping to the page. The guest still sees the lake and his name.
- Change the `lamp.play()` rejection on the untapped path: stay on the poster with the "Touch the lamp" hint instead of leaving after 7 s. `light()` already sets the 30 s safety timer, so nobody gets stuck. Note `lit` is already true by then, so a later tap returns early; reset `lit` on this failure so the tap can start the film.
- Update `theme-color` when the dissolve begins (B7).
- Use rVFC with `timeupdate` as the fallback for the stage timings (B5). This one is optional.

**3. Dawn sky layer (try after 1, your design call).** Instead of landing straight on the pale page, make `.film-sky` use the lake's real sky (top about `#6f8399`, then `#abb4b9`, `#e2e1d6`, fading out at the horizon; re-sample on a phone per B8). Stage one then shows almost nothing changing. Keep an identical layer in `#sky` during the handoff and fade it out over 3 to 4 s after the film, so the page brightens as if the sun were rising. It carries the film's idea into the page. Check the heading's contrast against the darker top during those seconds, especially "Om Shanti" and the portrait frame.

**4. Bridge clip (only if 1 and 3 still feel like a dissolve rather than a continuous shot).** This is the one idea needing new generation, and the only one that gives true continuous camera movement.

1. Extract the last frame: `ffmpeg -sseof -0.1 -i public/assets/lake.mp4 -update 1 lake-end.png`.
2. Make an end plate at 720x1280 from your `.sky-gradient` colours, with no portrait, no text and no sun disc (screenshot a plain page locally, or generate it with ffmpeg). Add slight grain so the model has texture to work with.
3. In Flow choose 9:16, Video > Frames, then Omni Flash 720p (4 s is 7 credits, 8 s is 12) or Veo 3.1 Lite (10 credits). Start with Omni at 360p (4 to 6 credits) to test the idea cheaply. Prompt along these lines: "Locked smooth camera tilts slowly upward from the lake into clear morning sky, no new objects, no text, calm, continuous."
4. Check the output. Compare its last frame with the plate, and watch for invented birds or text. Expect a few tries.
5. Join it to the lake in one file with a re-encode and `-movflags faststart`, keeping the join inside one `<video>`, because swapping video elements at the cut is the most likely place for a visible blink (*my inference*). Keep the same tags and compare side by side. Hold the bitrate near 2 Mbps, and shift the `intro.js` timings to suit.
6. Still fade the last 0.8 to 1 s over the page. Do not cut.

The opening grows by 4 s or so, so consider trimming the lake's start, or showing the caption during the tilt. The film runs about 15 s today from the tap (6.8 s of lamp, then about 7.9 s of lake). Remember the guest is here to RSVP.

Using Extend on the lake is cheaper in effort, but it gives no control of the end frame, so it is the weaker choice. An Omni edit of the existing clip costs 40 credits and is region-limited ([Edit videos](https://support.google.com/flow/answer/16935718?hl=en)); skip it.

**5. Baked dissolve (fallback only).** Use ffmpeg to burn the sky blend into the last 2 s of `lake.mp4`, so the effect plays even if a phone struggles with layered opacity. It is less flexible, since every design change means a re-encode, and it introduces the matching problem that the live approach avoids. Consider it only if testing shows recommendation 1 stuttering on an older phone.

### Not worth doing

- **View Transitions API.** Freezes the video, and offers nothing beyond an opacity fade (B6).
- **Alpha video.** Two encodes, Mac tooling, larger files; a CSS gradient does the job (B12).
- **Scroll-linked scrubbing.** Needs re-encoding, jittery seeks, and the wrong mood (B14).
- **AV1 or HEVC.** Your clips are already under 2 MB each. Older iPhones would need a fallback anyway (B13).
- **Upscaling to 1080p or 4K.** 4K costs 50 credits and is Ultra only; 1080p is unavailable without a subscription. Bigger files for no gain at phone sizes.
- **Pixel-exact last-frame matching or colour calibration.** Not promised by Google, not visible through a dissolve (A, B8).
- **Veo 3.1 Quality.** At 100 credits a try, a poor fit when the aim is a soft sky.
- **Scenebuilder or Jump To** for this job. A local join does it, and Jump To is unconfirmed.

## Could not verify

- **Device behaviour.** Nothing was run in a browser, by instruction. The Low Power Mode failure and unlock are read from WebKit source, not observed, and that source is the current `main` branch, which may differ from shipped iOS.
- **WhatsApp.** No first-party documentation of how it opens links on iPhone or Android; only secondary reporting.
- **Flow specifics.** Exact last-frame fidelity; whether free accounts can use every frames model; whether Omni's edit or frames features are offered in Malaysia ("certain countries", no list); whether uploaded local copies can be extended; whether Jump To still exists; the conflict between the credits and models pages over Extend on Fast and Quality.
- **Who wrote the odd colour tags.** The files show x264 and Lavf, which may be Flow's output or an earlier local re-encode. The Flow originals may have different tags or more keyframes.
- **Apple documentation.** Apple's "Delivering Video Content for Safari" page would not load, so iOS rules rest on WebKit's blog, bug tracker and source. The WebKit blog on iOS rules dates from 2016.
- **Chromium gamma handling.** The issue tracker needs a sign-in; not relied on.
- **Safari 26 `theme-color`.** A bug report only, not an official note.
