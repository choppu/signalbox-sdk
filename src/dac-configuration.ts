import { BoardInfo } from "./board-info";

export class DACConfiguration {
  index: number;
  enabled: boolean;
  prescaler: number;
  period: number;
  channelEnabled: boolean[];

  constructor(index: number, enabled: boolean, prescaler: number, period: number, channelEnabled: boolean[]) {
    this.index = index;
    this.enabled = enabled;
    this.prescaler = prescaler;
    this.period = period;
    this.channelEnabled = channelEnabled;
  }

  write(buf: Buffer, offset: number, boardInfo: BoardInfo) : number {
    let i = this.enabled ? (this.index | 0x80) : this.index;
    let prescSize = boardInfo.dac[this.index].prescalerSize;
    let periodSize = boardInfo.dac[this.index].periodSize;
    buf.writeUInt8(i, offset++);
    buf.writeUIntLE(this.prescaler, offset, prescSize);
    offset += prescSize;
    buf.writeUIntLE(this.period, offset, periodSize);
    offset += periodSize;

    this.channelEnabled.forEach((channelEnabled) => {
      let enabled = channelEnabled ? 0x80 : 0x00;
      buf.writeUInt8(enabled, offset++);
    });
    
    return offset;
  }

  public static fromPlainObject(dac: any) : DACConfiguration {
    return new DACConfiguration(dac.index, dac.enabled, dac.prescaler, dac.period, dac.channelEnabled);
  }
}