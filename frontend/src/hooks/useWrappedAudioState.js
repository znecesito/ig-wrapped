import { useEffect, useState } from "react";
import {
  getWrappedAudioState,
  subscribeWrappedAudio
} from "../utils/wrappedAudio.js";

export function useWrappedAudioState() {
  const [state, setState] = useState(getWrappedAudioState);

  useEffect(() => subscribeWrappedAudio(setState), []);

  return state;
}
