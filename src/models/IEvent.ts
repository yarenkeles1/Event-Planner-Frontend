export interface IEventPage {
  content: IEvent[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

export interface IEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  status: string;
  ownerId: number;
  ownerFullName: string;
  participationCount: number;
  imageUrl?: string;
}