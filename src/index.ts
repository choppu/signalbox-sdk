import { SignalBox } from "./signal-box"
import { BoardInfo } from "./board-info";
import { BoardConfiguration } from "./board-configuration";

export let SBox = {
  SignalBox: SignalBox,
  BoardInfo: BoardInfo,
  BoardConfiguration: BoardConfiguration,
}

export default SBox;
Object.assign(module.exports, SBox);
