import axios from 'axios';
import Dexie from 'dexie';
// import pkg from "../../package.json";

const db: any = new Dexie('yesplaymusic');

db.version(4).stores({
    trackDetail: '&id, updateTime',
    lyric: '&id, updateTime',
    album: '&id, updateTime',
});

db.version(3)
    .stores({
        trackSources: '&id, createTime',
    })
    .upgrade((tx: { table: (arg0: string) => { (): any; new(): any; toCollection: { (): { (): any; new(): any; modify: { (arg0: (track: any) => number | false): any; new(): any; }; }; new(): any; }; }; }) =>
        tx
            .table('trackSources')
            .toCollection()
            .modify(
                (track: { createTime: number; }) => !track.createTime && (track.createTime = new Date().getTime())
            )
    );

db.version(1).stores({
    trackSources: '&id',
});

let tracksCacheBytes = 0;

const deleteExcessCache = async () => {
    //缓存配置
    /* if (
        settings.value?.cacheLimit === false ||
        tracksCacheBytes < settings.value?.cacheLimit * Math.pow(1024, 2)
    ) {
        return;
    } */
    try {
        const delCache = await db.trackSources.orderBy('createTime').first();
        await db.trackSources.delete(delCache.id);
        tracksCacheBytes -= delCache.source.byteLength;
        console.debug(
            `[debug][db.js] deleteExcessCacheSucces, track: ${delCache.name}, size: ${delCache.source.byteLength}, cacheSize:${tracksCacheBytes}`
        );
        deleteExcessCache();
    } catch (error) {
        console.debug('[debug][db.js] deleteExcessCacheFailed', error);
    }
}

export const cacheTrackSource = (trackInfo: { name: any; ar: { name: any; }[]; artists: { name: any; }[]; al: { picUrl: any; }; id: any; }, url: string, bitRate: any, from = 'netease') => {
    if (!process.env.IS_ELECTRON) return;
    const name = trackInfo.name;
    const artist =
        (trackInfo.ar && trackInfo.ar[0]?.name) ||
        (trackInfo.artists && trackInfo.artists[0]?.name) ||
        'Unknown';
    let cover = trackInfo.al.picUrl;
    if (cover.slice(0, 5) !== 'https') {
        cover = 'https' + cover.slice(4);
    }
    axios.get(`${cover}?param=512y512`);
    axios.get(`${cover}?param=224y224`);
    axios.get(`${cover}?param=1024y1024`);
    return axios
        .get(url, {
            responseType: 'arraybuffer',
        })
        .then(response => {
            db.trackSources.put({
                id: trackInfo.id,
                source: response.data,
                bitRate,
                from,
                name,
                artist,
                createTime: new Date().getTime(),
            });
            console.debug(`[debug][db.js] cached track 👉 ${name} by ${artist}`);
            tracksCacheBytes += response.data.byteLength;
            deleteExcessCache();
            return { trackID: trackInfo.id, source: response.data, bitRate };
        });
}

export const getTrackSource = (id: any) => {
    return db.trackSources.get(Number(id)).then((track: { name: any; artist: any; }) => {
        if (!track) return null;
        console.debug(
            `[debug][db.js] get track from cache 👉 ${track.name} by ${track.artist}`
        );
        return track;
    });
}

export const cacheTrackDetail = (track: { id: any; }, privileges: any) => {
    db.trackDetail.put({
        id: track.id,
        detail: track,
        privileges: privileges,
        updateTime: new Date().getTime(),
    });
}

export const getTrackDetailFromCache = (ids: string[]) => {
    return db.trackDetail
        .filter((track: { id: any; }) => {
            return ids.includes(String(track.id));
        })
        .toArray()
        .then((tracks: any[]) => {
            const result = { songs: new Array(), privileges: new Array() };
            ids.map((id: string) => {
                const one = tracks.find((t: { id: any; }) => String(t.id) === id);
                result.songs.push(one?.detail);
                result.privileges.push(one?.privileges);
            });
            if (result.songs.includes(undefined)) {
                return undefined;
            }
            return result;
        });
}

export const cacheLyric = (id: any, lyrics: any) => {
    db.lyric.put({
        id,
        lyrics,
        updateTime: new Date().getTime(),
    });
}

export const getLyricFromCache = (id: any) => {
    return db.lyric.get(Number(id)).then((result: { lyrics: any; }) => {
        if (!result) return undefined;
        return result.lyrics;
    });
}

export const cacheAlbum = (id: any, album: any) => {
    db.album.put({
        id: Number(id),
        album,
        updateTime: new Date().getTime(),
    });
}

export const getAlbumFromCache = (id: any) => {
    return db.album.get(Number(id)).then((result: { album: any; }) => {
        if (!result) return undefined;
        return result.album;
    });
}

export const countDBSize = () => {
    const trackSizes: any[] = [];
    return db.trackSources
        .each((track: { source: { byteLength: any; }; }) => {
            trackSizes.push(track.source.byteLength);
        })
        .then(() => {
            const res = {
                bytes: trackSizes.reduce((s1, s2) => s1 + s2, 0),
                length: trackSizes.length,
            };
            tracksCacheBytes = res.bytes;
            console.debug(
                `[debug][db.js] load tracksCacheBytes: ${tracksCacheBytes}`
            );
            return res;
        });
}

export const clearDB = () => {
    return new Promise(resolve => {
        db.tables.forEach((table: { clear: () => void; }) => {
            table.clear();
        });
        resolve(false);
    });
}
