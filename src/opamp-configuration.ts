export class OPAMPConfiguration {
  index: number;
  enabled: boolean;
  gain: number;
  invertingInput: boolean;

  constructor(index: number, enabled: boolean, gain: number, invertingInput: boolean) {
    this.index = index;
    this.enabled = enabled;
    this.gain = gain;
    this.invertingInput = invertingInput;
  }

  write(buf: Buffer, offset: number) : number {
    let i = this.enabled ? (this.index | 0x80) : this.index;
    buf.writeUInt8(i, offset++);
    buf.writeUInt8(this.gain, offset++);
    let invInput = this.invertingInput ? 0x80 : 0x00;
    buf.writeUInt8(invInput, offset++);
    return offset;
  }

  public static fromPlainObject(opamp: any) : OPAMPConfiguration {
    return new OPAMPConfiguration(opamp.index, opamp.enabled, opamp.gain, opamp.invertingInput);
  }
}