"use client";
import { GogoanimeEpisodes } from "../data/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { animeVideoLink } from "../data/requests";
import loadVideoPlayer from "./video-loader";
import vidLinksCacher from "../data/vid-cacher";

const AnimeVideoPage = ({ data }: { data: GogoanimeEpisodes[] }) => {
  const [currentIndex, setIndex] = useState<number>(0);
  const [cacheStatus, setStatus] = useState<JSX.Element>(<></>);
  const [videoPlayer, setVideoPlayer] = useState<JSX.Element>(
    <div className="flex flex-col gap-4 justify-center">
      <div
        className="skeleton h-64 2xl:h-[47rem] md:h-[27rem] xl:h-[37rem] w-full"
        aria-label="Loading video player"
      ></div>
    </div>
  );
  const [vidLoadingIndicator, setVidLoadingIndicator] = useState<JSX.Element>(
    <></>
  );

  const vidStatus = (message: string) => {
    return (
      <div className="toast toast-top toast-center">
        <div className="alert alert-info">
          <span>{message}</span>
        </div>
      </div>
    );
  };

  const getVidLink = useCallback(
    async (index: number) => {
      setVidLoadingIndicator(vidStatus("Loading video, please wait..."));
      setVideoPlayer(
        <div className="flex flex-col gap-4 justify-center mb-2">
          <div
            className="skeleton h-64 2xl:h-[47rem] md:h-[27rem] xl:h-[37rem] w-full"
            aria-label="Loading video player"
          ></div>
        </div>
      );
      const vidId = data[index].id;
      const res = await animeVideoLink(vidId);
      const url = res.sources[res.sources.length - 2].url;
      const vidPlay = loadVideoPlayer(url, `Episode ${index + 1}`);
      setVidLoadingIndicator(<></>);
      setVideoPlayer(vidPlay);
    },
    [data]
  );

  useEffect(() => {
    getFirstVidLink(data[0].id);
    cacheIndicator();
  }, []);

  const getFirstVidLink = useCallback(async (id: string) => {
    const data = await animeVideoLink(id);
    const url = data.sources[data.sources.length - 2].url;
    const vidPlay = loadVideoPlayer(url, "Episode 1");
    setVideoPlayer(vidPlay);
  }, []);

  const cacheIndicator = async () => {
    const status = await vidLinksCacher(data);
    setStatus(
      <div className="toast" role="status" aria-live="polite">
        <div className="alert alert-info">
          <span>
            {status
              ? "Video links pre-fetched successfully."
              : "Some error occurred"}
          </span>
        </div>
      </div>
    );
    setTimeout(() => {
      setStatus(<></>);
    }, 3000);
  };

  const dataMemoized = useMemo(() => data, [data]);

  return (
    <main>
      {vidLoadingIndicator}
      <div className="flex flex-col overflow-x-hidden h-full">
        <div>{videoPlayer}</div>
        <div className="flex flex-row justify-center items-center mb-1">
          <button
            className="btn btn-warning btn-sm"
            disabled={currentIndex === 0}
            onClick={() => {
              const newIndex = currentIndex - 1;
              setIndex(newIndex);
              getVidLink(newIndex);
            }}
            aria-label="Previous episode"
            title="Previous episode"
          >
            Previous
          </button>
          <div className="divider divider-horizontal" aria-hidden="true">
            OR
          </div>
          <button
            className="btn btn-success btn-sm"
            disabled={currentIndex === data.length - 1}
            onClick={() => {
              const newIndex = currentIndex + 1;
              setIndex(newIndex);
              getVidLink(newIndex);
            }}
            aria-label="Next episode"
            title="Next episode"
          >
            Next
          </button>
        </div>
        <div className="collapse bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">
            Episodes - click here to show
          </div>
          <div className="collapse-content">
            <div className="flex flex-col h-60 overflow-auto p-1" role="list">
              {dataMemoized.map((item, index) => (
                <button
                  className="btn mb-2 btn-neutral btn-sm "
                  key={index}
                  onClick={() => {
                    setIndex(index);
                    getVidLink(index);
                  }}
                  aria-label={`Episode ${item.number.toString()}`}
                  title={`Episode ${item.number.toString()}`}
                  role="listitem"
                >
                  Episode {item.number.toString()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {cacheStatus}
    </main>
  );
};

export default AnimeVideoPage;
