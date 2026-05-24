// api/download.js
export default async function handler(req, res) {
    // CORS Header সেটিংস (ফ্রন্টএন্ডের সাথে কানেক্ট করার জন্য)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ফ্রন্টএন্ড থেকে আসা ভিডিও লিংক (?url=https://tiktok.com/...)
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: "error", detail: "অনুগ্রহ করে একটি টিকটক ভিডিও লিংক পেস্ট করুন।" });
    }

    try {
        // 🚀 এটিই হলো আপনার এপিআই প্রোভাইডারের মূল ভিডিও অ্যানালাইসিস/ডাউনলোড এন্ডপয়েন্ট
        const targetApiUrl = `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`;

        const response = await fetch(targetApiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'b3ad11e41cmshb18121f061df58ep1b5c61jsnd7a63dda9d56', // আপনার দেওয়া কি
                'x-rapidapi-host': 'tiktok-video-no-watermark2.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`RapidAPI Error Status: ${response.status}`);
        }

        const result = await response.json();

        // এপিআই-এর ডাটা স্ট্রাকচার (data.data.play বা data.data.hdplay) অনুযায়ী রেসপন্স পাঠানো
        if (result && result.data) {
            // ওয়াটারমার্ক ছাড়া ভিডিওর আসল প্লে-লিংক
            const directLink = result.data.play || result.data.hdplay || result.data.wmplay || "";
            const title = result.data.title || "TikTok Video By Shadow Joker";

            if (directLink) {
                return res.status(200).json({
                    status: "success",
                    title: title,
                    platform: "TikTok",
                    download_link: directLink // এই লিংকটিই ফ্রন্টএন্ডে "Save File" বাটনে কাজ করবে
                });
            }
        }

        return res.status(422).json({ status: "error", detail: "এপিআই কোনো সরাসরি ডাউনলোড লিংক জেনারেট করতে পারেনি।" });

    } catch (error) {
        return res.status(500).json({ status: "error", detail: error.message });
    }
}
