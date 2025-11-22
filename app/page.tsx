"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, SkipBack, SkipForward } from "lucide-react";

const videoList = [
    {title: "Vídeo 01", src: "/videos/video1.mp4"},
    {title: "Vídeo 02", src: "/videos/video2.mp4"},
    {title: "Vídeo 03", src: "/videos/video3.mp4"},
];

export default function Home() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [lastVolume, setLastVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isVolumeVisible, setIsVolumeVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const currentVideo = videoList[currentVideoIndex];
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const isSeeking = useRef(false);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const volumeBackground = `linear-gradient(to right, #be2929 ${volume * 100}%, #262728 ${volume * 100}%)`;
    const progressBackground = `linear-gradient(to right, #1a54d4 ${progress}%, #262728 ${progress}%)`;

    useEffect(() => {
        setIsPlaying(false);
        setVolume(0.5);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
    
        video.load();
        setCurrentTime(0);
        setProgress(0);

        if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        }

        const setVideoData = () => setDuration(video.duration);
        video.addEventListener('loadedmetadata', setVideoData);
        return () => video.removeEventListener('loadedmetadata', setVideoData);
    }, [currentVideoIndex]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || isSeeking.current) return;

        if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        } else {
            video.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = volume;
    }, [volume]);


    const handleTimeUpdate = () => {
        if (!isSeeking.current && videoRef.current && videoRef.current.duration) {
            setCurrentTime(videoRef.current.currentTime);
            const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            if (!isNaN(newProgress)) setProgress(newProgress);
        }
    }
    
    const handleSeekMouseDown = () => {
        isSeeking.current = true;
        videoRef.current?.pause();
    }

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        const newProgress = parseFloat(target.value);
        
        if (videoRef.current && duration) {
            videoRef.current.currentTime = (newProgress / 100) * duration;
        }
        
        isSeeking.current = false;

        if (isPlaying) {
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
        }
    }

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);
        if (duration) setCurrentTime((newProgress / 100) * duration);
    }

    const handleNext = () => {
        setCurrentVideoIndex((prev) => (prev + 1) % videoList.length);
        setIsPlaying(true);
    }

    const handlePrevious = () => {
        setCurrentVideoIndex((prev) => (prev - 1 + videoList.length) % videoList.length);
        setIsPlaying(true);
    }

    const seekBackward = () => { if (videoRef.current) videoRef.current.currentTime -= 10; };
    const seekForward = () => { if (videoRef.current) videoRef.current.currentTime += 10; };

    const toggleMute = () => {
        if (isMuted || volume === 0) {
            setIsMuted(false);
            setVolume(lastVolume || 0.5);
        } else {
            setIsMuted(true);
            setLastVolume(volume);
            setVolume(0);
        }
    }

    return (
        <div className="w-screen h-screen bg-[#222] flex justify-center items-center text-white p-10 gap-6">
            <div className="w-[300px] h-[500px] bg-[#333] rounded-lg p-4 overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Playlist</h3>
                <ul className="space-y-2">
                    {videoList.map((video, index) => (
                        <li key={index} onClick={() => { setCurrentVideoIndex(index); setIsPlaying(true); }}
                            className={`p-3 rounded cursor-pointer transition-colors ${index === currentVideoIndex ? 'bg-[#1a54d4]' : 'hover:bg-[#444] bg-[#2a2a2a]'}`}
                        >
                            <p className="font-medium text-sm">{video.title}</p>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="w-[800px] h-[600px] bg-[#333] rounded-lg p-8 flex flex-col justify-between">
                <div className="h-[75%] flex flex-col justify-center relative">
                    <video
                        ref={videoRef}
                        src={currentVideo.src}
                        className="w-full h-full object-contain cursor-pointer"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleNext}
                        onClick={() => setIsPlaying(!isPlaying)}
                        controls={false}
                    />
                    <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-sm pointer-events-none">{currentVideo.title}</div>
                </div>

                <div className="h-[20%] flex flex-col justify-end">
                    <div className="w-full mt-4">
                        <input type="range" min="0" max="100" value={progress || 0}
                            onMouseDown={handleSeekMouseDown} onMouseUp={handleSeekMouseUp} onChange={handleProgressChange}
                            style={{ background: progressBackground }}
                            className="w-full h-[5px] bg-[#262728] appearance-none cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <div className="flex mt-1 justify-between text-gray-400 text-sm">
                            <p>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</p>
                            <p>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</p>
                        </div>
                    </div>

                    <div className="flex px-4 mt-5 justify-between items-center">
                        <button className="cursor-pointer" onClick={handlePrevious}><SkipBack/></button>
                        <button className="cursor-pointer" onClick={seekBackward}><RotateCcw/></button>
                        <button className="cursor-pointer bg-[#be2929] w-12 h-12 rounded-full flex justify-center items-center hover:scale-105" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <Pause fill="white"/> : <Play fill="white" className="ml-1"/>}
                        </button>
                        <button className="cursor-pointer" onClick={seekForward}><RotateCw/></button>
                        <button className="cursor-pointer" onClick={handleNext}><SkipForward/></button>
                        
                        <div className="relative flex items-center" 
                            onMouseEnter={() => { if(hideTimer.current) clearTimeout(hideTimer.current); setIsVolumeVisible(true); }}
                            onMouseLeave={() => { hideTimer.current = setTimeout(() => setIsVolumeVisible(false), 300); }}
                        >
                            <button className="cursor-pointer" onClick={toggleMute}>
                                {isMuted || volume === 0 ? <VolumeX/> : <Volume2/>}
                            </button>
                            {isVolumeVisible && (
                                <div className="absolute bottom-8 left-0.6 -translate-x-1/2 bg-[#444] p-3 rounded shadow-lg rotate-[-90deg] origin-bottom">
                                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => {setVolume(parseFloat(e.target.value)); setIsMuted(false);}} style={{ background: volumeBackground}} className="w-20 h-[4px] bg-[#222] appearance-none cursor-pointer rounded"/>
                                </div>                                
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}