import { TimeToDatePipe } from './time-to-date.pipe';

describe('TimeToDatePipe', () => {
  it('create an instance', () => {
    const pipe = new TimeToDatePipe();
    expect(pipe).toBeTruthy();
  });
});
