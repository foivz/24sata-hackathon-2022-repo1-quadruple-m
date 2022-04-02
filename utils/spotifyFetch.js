const nowPlaying = require("./spotify");
const fetchNowPlaying = async api => {
    // console.log(new Date(), "fetchNowPlaying")

    const {
        item = {},
        is_playing: isPlaying = false,
        progress_ms: progress = 0,
    } = await nowPlaying();

    if (!isPlaying) {
        api.mongo.db("main").collection("spotify").updateOne({_id: "now-playing-data"}, {
            $set: {
                isPlaying,
            }
        })
        return
    }

    try {
        const {duration_ms: duration, name: track, artists, external_urls} = item;
        const {images = []} = item.album || {};
        let href = ""
        if (external_urls) href = external_urls.spotify

        const cover = images[images.length - 1].url;

        api.mongo.db("main").collection("spotify").updateOne({_id: "now-playing-data"}, {
            $set: {
                href,
                isPlaying,
                progress,
                duration,
                track,
                cover,
                artists
            }
        })
    } catch (e) {
        api.mongo.db("main").collection("spotify").updateOne({_id: "now-playing-data"}, {
            $set: {
                isPlaying: false,
            }
        })
    }
}

module.exports = fetchNowPlaying
