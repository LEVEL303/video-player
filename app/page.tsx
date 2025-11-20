"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, SkipBack, SkipForward } from "lucide-react";

const videoList = [
    {title: "video1", src: "/videos/video1.mp4"},
    {title: "video2", src: "/videos/video2.mp4"},
    {title: "video3", src: "/videos/video3.mp4"},
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
    
    const videoRef = useRef(null);
    const isSeeking = useRef(false);
    const hideTimer = useRef<number | null>(null);

    const volumeBackground = `linear-gradient(to right, #be2929 ${volume * 100}%, #262728 ${volume * 100}%)`;
    const progressBackground = `linear-gradient(to right, #1a54d4 ${progress}%, #262728 ${progress}%)`;

    useEffect(() => {
        setIsPlaying(false);
        setVolume(0.5);
        setIsVolumeVisible(false);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
    
        video.load();
        setCurrentTime(0);
        setProgress(0);

        if (isPlaying) {
            video.play();
        }

        const setAudioData = () => {
            setDuration(video.duration);
        };

        if (video.readyState > 0) {
            setAudioData();
        } else {
            video.addEventListener('loadedmetadata', setAudioData);
        }

        return () => {
            video.removeEventListener('loadedmetadata', setAudioData);
        };
    }, [currentVideoIndex]);

    useEffect(() => {
        if (!isSeeking.current) {
            if (isPlaying) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`; 
    }

    const toggleMute = () => {
        if (isMuted || volume === 0) {
            setIsMuted(false);
            setVolume(lastVolume);
        } else {
            setIsMuted(true);
            setLastVolume(volume);
            setVolume(0);
        }
    }

    const handleTimeUpdate = () => {
        if (!isSeeking.current && videoRef.current.duration) {
            setCurrentTime(videoRef.current.currentTime);
            const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            if (!isNaN(newProgress)) {
                setProgress(newProgress);
            }
        }
    }
    
    const handleSeekMouseDown = () => {
        isSeeking.current = true;
        videoRef.current.pause();
    }

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        const newProgress = parseFloat(target.value);
        if (duration && !isNaN(duration)) {
            videoRef.current.currentTime = (newProgress / 100) * duration;
        }
        isSeeking.current = false;

        if (isPlaying) {
            videoRef.current.play();
        }
    }

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);

        if (duration && !isNaN(duration)) {
            setCurrentTime((newProgress / 100) * duration);
        }
    }

    const handleMouseEnter = () => {
        if (hideTimer.current) {
            window.clearTimeout(hideTimer.current);
        }
        setIsVolumeVisible(true);
    };

    const handleMouseLeave = () => {
        hideTimer.current = window.setTimeout(() => {
            setIsVolumeVisible(false);
        }, 300);
    };

    const seekBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime -= 10;
        }
    };

    const seekForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime += 10;
        }
    }

    const handleNext = () => {
        setCurrentVideoIndex((prev) => (prev + 1) % videoList.length);
        setIsPlaying(true);
    }

    const handlePrevious = () => {
        setCurrentVideoIndex((prev) => (prev - 1 + videoList.length) % videoList.length);
        setIsPlaying(true);
    }

    const playVideoFromList = (index: number) => {
        setCurrentVideoIndex(index);
        setIsPlaying(true);
    }
 
    return (
        <>         
            <div className="w-screen h-screen bg-[#222] flex justify-center items-center text-white p-10 gap-6">
                
                <div className="w-[300px] h-[500px] bg-[#333] rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-xl front-bold mb-4 border-b border-gray-600 pb-2">Lista de vídeos</h3>
                    <ul className="space-y-2">
                        {videoList.map((video, index) => (
                            <li
                                key={index}
                                onClick={() => playVideoFromList(index)}
                                className={`p-3 rounded cursor-pointer transition-colors ${
                                    index === currentVideoIndex ? 'bg-[#1a54d4]' : 'hover:bg-[#444] bg-[#2a2a2a]' 
                                }`}
                            >
                                <p className="font-medium text-sm">{video.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="w-[800px] h-[600px] bg-[#333] rounded-lg p-8 flex flex-col justify-between">
                    <div className="h-[75%] flex flex-col justify-center overflow-hidden relative group">
                        <video
                            ref={videoRef}
                            src={currentVideo.src}
                            className="w-full h-full object-contain cursor-pointer rounded-lg"
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleNext}
                            onClick={() => setIsPlaying(!isPlaying)}
                            controls={false}
                        />
                        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-sm">
                            {currentVideo.title}
                        </div>
                    </div>

                    <div className="h-[20%] flex flex-col justify-end">
                        <div className="w-full mt-4">
                            <input 
                                type="range" 
                                min="0"
                                max="100"
                                value={progress || 0}
                                onMouseDown={handleSeekMouseDown}
                                onMouseUp={handleSeekMouseUp}
                                onChange={handleProgressChange}
                                style={{ background: progressBackground }}
                                className={`
                                    w-full h-[5px] appearance-none cursor-pointer
                                    
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:h-3
                                    [&::-webkit-slider-thumb]:w-3
                                    [&::-webkit-slider-thumb]:bg-white
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:border-0

                                    [&::-moz-range-thumb]:appearance-none
                                    [&::-moz-range-thumb]:h-3
                                    [&::-moz-range-thumb]:w-3
                                    [&::-moz-range-thumb]:bg-white
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:border-0
                                `}
                            />
                            <div className="flex mt-[-5px] justify-between text-[0.95rem] text-gray-400">
                                <p>{ formatTime(currentTime) }</p>
                                <p>{ formatTime(duration) }</p>
                            </div>
                        </div>

                        <div className="flex px-4 mt-5 justify-between">
                            
                            <button onClick={handlePrevious} className="cursor-pointer"> <SkipBack size={20}/> </button>
                            <button onClick={seekBackward} className="cursor-pointer"> <RotateCcw size={20}/> </button>

                            <button onClick={() => setIsPlaying(!isPlaying)} className="bg-[#be2929] w-10 h-10 rounded-full cursor-pointer flex justify-center items-center">
                                {isPlaying ? <Pause/> : <Play/>}
                            </button>

                            <button onClick={seekForward} className="cursor-pointer"> <RotateCw size={20}/> </button>
                            <button onClick={handleNext} className="cursor-pointer"> <SkipForward size={20}/> </button>

                            <div 
                                className="relative flex items-center" 
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button onClick={toggleMute} className="cursor-pointer">
                                    {isMuted || volume === 0 ? <VolumeX/> : <Volume2/>}
                                </button>

                                {isVolumeVisible && (
                                    <div className="absolute right-0 bottom-full mb-2 bg-[#444] p-2 rounded">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={volume}
                                            onChange={(e) => {
                                                const newVolume = parseFloat(e.target.value);
                                                setVolume(newVolume);
                                                if (newVolume > 0) {
                                                    setIsMuted(false);
                                                }
                                            }}
                                            style={{ background: volumeBackground}}
                                            className={`
                                                w-24 h-[5px] bg-[#262728] appearance-none cursor-pointer

                                                [&::-webkit-slider-thumb]:appearance-none
                                                [&::-webkit-slider-thumb]:h-3
                                                [&::-webkit-slider-thumb]:w-3
                                                [&::-webkit-slider-thumb]:bg-white
                                                [&::-webkit-slider-thumb]:rounded-full
                                                [&::-webkit-slider-thumb]:border-0

                                                [&::-moz-range-thumb]:appearance-none
                                                [&::-moz-range-thumb]:h-3
                                                [&::-moz-range-thumb]:w-3
                                                [&::-moz-range-thumb]:bg-white
                                                [&::-moz-range-thumb]:rounded-full
                                                [&::-moz-range-thumb]:border-0
                                            `}
                                        />
                                        <p className="text-center text-xs mt-1">{Math.round(volume * 100)}%</p>
                                    </div>                                
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
