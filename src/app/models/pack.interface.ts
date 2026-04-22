export interface Pack {
  id: number,
  description: string,
  price: number,
  duration: string,
  classCount: number,
  active: boolean,
  isSelected?: boolean;
}
