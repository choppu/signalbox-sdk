import { ADCInfo } from "./adc-info";
import { DACInfo } from "./dac-info";
import { OPAMPInfo } from "./opamp-info";

export class BoardInfo {
  name: string;
  vendorID: string;
  productID: string;
  frequency: number;
  adc: ADCInfo[];
  dac: DACInfo[];
  opamp: OPAMPInfo[];

  constructor(name: string, vendorID: string, productID: string, frequency: number, adc: ADCInfo[], dac: DACInfo[], opamp: OPAMPInfo[]) {
    this.name = name;
    this.vendorID = vendorID;
    this. productID = productID;
    this.frequency = frequency;
    this.adc = adc;
    this.dac = dac;
    this.opamp = opamp;
  }

  public static getBoard(vendorID?: string, productID?: string) : BoardInfo | null {
    if(vendorID == '0483' && productID == '5740') {
      return new BoardInfo(
        "SignalBox 1", 
        vendorID, 
        productID, 
        80000000,
        [
          new ADCInfo(
            2, 
            1, 
            [
              {label: "off", value: 0, maxValue: 0x0fff},
              {label: "2x", value: 2, maxValue: 0x1ffe},
              {label: "4x", value: 3, maxValue: 0x3ffc},
              {label: "8x", value: 4, maxValue: 0x7ff8},
              {label: "16x", value: 5, maxValue: 0xfff0},
              {label: "32x", value: 6, maxValue: 0xfff0},
              {label: "64x", value: 7, maxValue: 0xfff0},
              {label: "128x", value: 8, maxValue: 0xfff0},
              {label: "256x", value: 9, maxValue: 0xfff0}
            ],
            [
              {label: "15 Cycles", value: 0},
              {label: "19 Cycles", value: 1},
              {label: "25 Cycles", value: 2},
              {label: "37 Cycles", value: 3},
              {label: "60 Cycles", value: 4},
              {label: "105 Cycles", value: 5},
              {label: "260 Cycles", value: 6},
              {label: "653 Cycles", value: 7},
            ],
            2,
            2)],
        [
          new DACInfo(
            2,
            1,
            0x0fff,
            2,
            2
          )],
        [
          new OPAMPInfo([
            {label: "Standalone", value: 0},
            {label: "1x (Follower)", value: 1},
            {label: "2x", value: 2},
            {label: "4x", value: 4},
            {label: "8x", value: 8},
            {label: "16x", value: 16}
          ])
        ]);
    } else {
      return null;
    }
  }

  public static getSampleFrequency(prescaler: number, period: number, boardFrequency: number) : number {
    return boardFrequency / ((prescaler + 1) * (period + 1));
  }

  public static getPrescalerAndPeriod(frequency: number, maxPrescaler: number, maxPeriod: number, boardFrequency: number) : {prescaler: number, period: number, precise: boolean} {
    let eq = Math.round(boardFrequency / frequency);
    let precise = (eq == boardFrequency / frequency);
    let prescaler = 0;

    for(let i = 0; i < maxPrescaler; i++) {
      if (((eq % i) == 0) && (((eq / i) - 1) < maxPeriod)) {
        prescaler = i;
        break;
      }
    }

    return {prescaler: prescaler - 1, period: (eq / prescaler) - 1, precise: precise};
  }
}