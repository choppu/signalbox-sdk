export class DACInfo {
  sampleSize: number;
  channelCount: number;
  maxValue: number;
  prescalerSize: number;
  periodSize: number;

  constructor(sampleSize: number, channelCount: number, maxValue: number, prescalerSize: number, periodSize: number) {
   this.sampleSize = sampleSize;
   this.channelCount = channelCount;
   this.maxValue = maxValue; 
   this.prescalerSize = prescalerSize;
   this.periodSize = periodSize;
  }
}