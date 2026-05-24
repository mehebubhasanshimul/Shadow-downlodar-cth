// api/download.js
export default async function handler(req, res) {
    // CORS Header সেট করা (ফ্রন্টএন্ড থেকে রিকোয়েস্ট এক্সেস করার জন্য)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: "error", detail: "ভিডিও ইউআরএল দেওয়া হয়নি।" });
    }

    try {
        // নোট: RapidAPI-তে নির্দিষ্ট ভিডিও ডাউনলোডের জন্য সাধারণত ইউআরএল প্যাস করতে হয়।
        // আপনার দেওয়া cURL-এর এন্ডপয়েন্টটি (user/khaby.lame) প্রোফাইল ডাটার জন্য ছিল।
        // নিচে ভিডিও ডাউনলোডের স্ট্যান্ডার্ড এন্ডপয়েন্টে রিকোয়েস্ট পাঠানো হচ্ছে:
        const targetApiUrl = `https://tiktok-video-downloader-api.p.rapidapi.com/dl?url=${encodeURIComponent(url)}`;

        const response = await fetch(targetApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
                'x-rapidapi-key': 'b3ad11e41cmshb18121f061df58ep1b5c61jsnd7a63dda9d56' // আপনার প্রদত্ত কি
            }
        });

        if (!response.ok) {
            throw new Error(`RapidAPI responded with status: ${response.status}`);
        }

        const data = await response.json();

        // এপিআই-এর রেসপন্স ফরম্যাট অনুযায়ী ডাটা ম্যাপ করা
        if (data && (data.video || data.download_urls)) {
            // আপনার এপিআই-এর সঠিক রেসপন্স কী (Key) অনুযায়ী নিচের লাইনগুলো কিছুটা পরিবর্তন হতে পারে
            const directVideoLink = data.video || (data.download_urls && data.download_urls[0]) || "";
            const videoTitle = data.title || data.description || "TikTok Video";

            return res.status(200).json({
                status: "success",
                title: videoTitle,
                platform: "TikTok",
                download_link: directVideoLink
            });
        } else {
            return res.status(422).json({ status: "error", detail: "ভিডিও স্ট্রিম লিঙ্ক খুঁজে পাওয়া যায়নি।" });
        }

    } catch (error) {
        return res.status(500).json({ status: "error", detail: error.message });
    }
}
