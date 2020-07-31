import { BoardInfo } from "./board-info";

export class ADCConfiguration {
  index: number;
  enabled: boolean;
  oversampling: number;
  prescaler: number;
  period: number;
  channelConfig: {enabled: boolean, sampleTime: number}[]

  constructor(index: number, enabled: boolean, oversampling: number, prescaler: number, period: number, channelConfig: {enabled: boolean, sampleTime: number}[]) {
    this.index = index;
    this.enabled = enabled;
    this.oversampling = oversampling;
    this.prescaler = prescaler;
    this.period = period;
    this.channelConfig = channelConfig;
  }

  write(buf: Buffer, offset: number, boardInfo: BoardInfo) : number {
    let i = this.enabled ? (this.index | 0x80) : this.index;
    let prescSize = boardInfo.adc[this.index].prescalerSize;
    let periodSize = boardInfo.adc[this.index].periodSize;
    buf.writeUInt8(i, offset++);
    buf.writeUInt8(this.oversampling, offset++);
    buf.writeUIntLE(this.prescaler, offset, prescSize);
    offset += prescSize;
    buf.writeUIntLE(this.period, offset, periodSize);
    offset += periodSize;

    this.channelConfig.forEach((channel) => {
      let enabled = channel.enabled ? 0x80 : 0x00;
      buf.writeUInt8(enabled, offset++);
      buf.writeUInt8(channel.sampleTime, offset++);
    });
    
    return offset;
  }
}