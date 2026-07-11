import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { PipelineScene } from "./scenes/PipelineScene";
import { ChatDemoScene } from "./scenes/ChatDemoScene";
import { TechStackScene } from "./scenes/TechStackScene";
import { OutroScene } from "./scenes/OutroScene";

const TITLE = 90;
const PROBLEM = 150;
const PIPELINE = 180;
const CHAT = 150;
const STACK = 120;
const OUTRO = 90;

export const PROMO_DURATION = TITLE + PROBLEM + PIPELINE + CHAT + STACK + OUTRO;

const PromoVideo: React.FC = () => {
  let cursor = 0;
  const next = (durationInFrames: number) => {
    const from = cursor;
    cursor += durationInFrames;
    return { from, durationInFrames };
  };

  return (
    <AbsoluteFill>
      <Sequence {...next(TITLE)}>
        <TitleScene />
      </Sequence>
      <Sequence {...next(PROBLEM)}>
        <ProblemScene />
      </Sequence>
      <Sequence {...next(PIPELINE)}>
        <PipelineScene />
      </Sequence>
      <Sequence {...next(CHAT)}>
        <ChatDemoScene />
      </Sequence>
      <Sequence {...next(STACK)}>
        <TechStackScene />
      </Sequence>
      <Sequence {...next(OUTRO)}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export const PromoComposition: React.FC = () => {
  return (
    <Composition
      id="Promo"
      component={PromoVideo}
      durationInFrames={PROMO_DURATION}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
