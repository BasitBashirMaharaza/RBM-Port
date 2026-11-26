import {trekCollection} from './trekCollection.js';
import {cinemaCollection} from './cinemaCollection.js';
import {gamingCollection} from './gamingCollection.js';
import {socialProfiles} from './socialProfiles.js';
// Personal choices and profile URLs can be added here without changing the shelf.
export const beyondBooks = [
 {id:'trails',title:'Trekking & camping',coverTitle:'The long way.',kicker:'OUTSIDE THE EVERYDAY',caption:'A little farther from the usual.',note:'Fresh air. Open skies. A different perspective.',color:'#b6c4a8',ink:'#283f35',entries:trekCollection,url:null,coverImage:null},
 {id:'music',video:'/beyond-cv/music/favourite-songs-cover.mp4',videoPoster:'/beyond-cv/music/favourite-songs-cover.jpg',title:'Favourite songs',coverTitle:'On repeat.',kicker:'THE PERSONAL SOUNDTRACK',caption:'A soundtrack for the in-between.',note:'Some things are better with a soundtrack.',color:'#c1b8de',ink:'#30293e',entries:[
  {title:'All the Stars',artist:'Kendrick Lamar & SZA',url:'https://open.spotify.com/track/3GCdLUSnKSMJhs4Tj6CV3s',youtubeMusic:'https://music.youtube.com/watch?v=JQbjS0_ZfJ0',cover:"/beyond-cv/music/01.jpg",preview:"/beyond-cv/music/previews/01.mp3",accent:"#b6a36c"},
  {title:'Loser',artist:'Tame Impala',url:'https://open.spotify.com/track/3RmFPuTTAjSQ2pbEd2j9oA',youtubeMusic:'https://music.youtube.com/watch?v=GQgL-Dk9sq0',cover:"/beyond-cv/music/02.jpg",preview:"/beyond-cv/music/previews/02.mp3",accent:"#a59bae"},
  {title:'The Hype',artist:'twenty one pilots',url:'https://open.spotify.com/track/7I3skNaQdvZSS7zXY2VHId',youtubeMusic:'https://music.youtube.com/watch?v=frFdisA68Lo',cover:"/beyond-cv/music/03.jpg",preview:"/beyond-cv/music/previews/03.mp3",accent:"#b4ad4f"},
  {title:'Cruel',artist:'Snakehips feat. ZAYN',url:'https://open.spotify.com/track/5kCWY8pUNIcwLrggLMCKPk',youtubeMusic:'https://music.youtube.com/watch?v=JIe7UGgpo0U',cover:"/beyond-cv/music/04.jpg",preview:"/beyond-cv/music/previews/04.mp3",accent:"#6c97ae"},
  {title:'Die For You — Remix',artist:'The Weeknd & Ariana Grande',url:'https://open.spotify.com/track/7oDd86yk8itslrA9HRP2ki',youtubeMusic:'https://music.youtube.com/watch?v=SyhtTI-ck1c',cover:"/beyond-cv/music/05.jpg",preview:"/beyond-cv/music/previews/05.mp3",accent:"#c96a68"},
  {title:'No Guidance',artist:'Chris Brown feat. Drake',url:'https://open.spotify.com/track/5PDImM7DglB3cvlkHWWz2h',youtubeMusic:'https://music.youtube.com/watch?v=B9AmEHvCA0c',cover:"/beyond-cv/music/06.jpg",preview:"/beyond-cv/music/previews/06.mp3",accent:"#7186c0"},
  {title:'Space Bound',artist:'Eminem',url:'https://open.spotify.com/track/4FX6ZSi5Hcb4aOZarFlIxH',youtubeMusic:'https://music.youtube.com/watch?v=BDrG1q-9rTY',cover:"/beyond-cv/music/07.jpg",preview:"/beyond-cv/music/previews/07.mp3",accent:"#97abb3"},
  {title:'Feels',artist:'Calvin Harris',url:'https://open.spotify.com/track/5bcTCxgc7xVfSaMV3RuVke',youtubeMusic:'https://music.youtube.com/watch?v=fqqcXP1D0Fw',cover:"/beyond-cv/music/08.jpg",preview:"/beyond-cv/music/previews/08.mp3",accent:"#d39277"},
  {title:'Anyone But You',artist:'Still Woozy',url:'https://open.spotify.com/track/4faTuWPQeMo24zvuTDre3c',youtubeMusic:'https://music.youtube.com/watch?v=h4ubkIy2jA0',cover:"/beyond-cv/music/09.jpg",preview:"/beyond-cv/music/previews/09.mp3",accent:"#b4ae82"},
  {title:'Deserve You',artist:'Justin Bieber',url:'https://open.spotify.com/track/5NU40QTlXrDUJzDBdv79bg',youtubeMusic:'https://music.youtube.com/watch?v=sIa40F9_CDI',cover:"/beyond-cv/music/10.jpg",preview:"/beyond-cv/music/previews/10.mp3",accent:"#64aaa1"},
 ],url:null,coverImage:null},
 {id:'cinema',video:'/beyond-cv/cinema/favourite-movies-cover.mp4',videoPoster:'/beyond-cv/cinema/favourite-movies-cover.jpg',title:'Favourite movies',coverTitle:'One more scene.',kicker:'OFF-SCREEN STORIES',caption:'The stories that stay.',note:'A different world, for a little while.',color:'#e5d6ae',ink:'#34352b',entries:cinemaCollection,url:null,coverImage:null},
 {id:'games',video:'/beyond-cv/games/favourite-games-cover.mp4',videoPoster:'/beyond-cv/games/favourite-games-cover.jpg',title:'Favourite games',coverTitle:'Press play.',kicker:'A DIFFERENT KIND OF PLAY',caption:'Room for a little play.',note:'A pause from the everyday.',color:'#728298',ink:'#f1eee0',entries:gamingCollection,url:null,coverImage:null},
 {id:'social',video:'/beyond-cv/social/social-cover.mp4',videoPoster:'/beyond-cv/social/social-cover.jpg',title:'Social media',coverTitle:'Beyond the feed.',kicker:'MOMENTS & STORIES',caption:'A little more of my world.',note:'Different ways to share the story.',color:'#c6b7ca',ink:'#42334b',entries:socialProfiles,url:null,coverImage:null},
];


