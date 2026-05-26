import { request } from '../shared/apiClient';

export interface HomeTravelMood {
  id: string;
  title: string;
  description: string;
  iconName: string;
  imageUrl: string;
  queryString: string;
}

export interface HomeEditorialDestination {
  id: string;
  locationId: number;
  locationName: string;
  tags: string[];
  imageUrl: string;
  bestTime: string;
  experience: string;
  staysCount: number;
  isLarge: boolean;
}

export interface HomeWeekendEscape {
  id: number;
  origin: string;
  locationId: number;
  locationName: string;
  duration: string;
  description: string;
  imageUrl: string;
}

export interface HomeStayCollection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  staysCount: number;
  queryString: string;
}

export const homeService = {
  getTravelMoods: (): Promise<HomeTravelMood[]> => {
    return request<HomeTravelMood[]>('/home/moods');
  },

  getEditorialDestinations: (): Promise<HomeEditorialDestination[]> => {
    return request<HomeEditorialDestination[]>('/home/editorial-destinations');
  },

  getWeekendEscapes: (origin: string = 'hanoi'): Promise<HomeWeekendEscape[]> => {
    return request<HomeWeekendEscape[]>(`/home/weekend-escapes?origin=${origin}`);
  },

  getStayCollections: (): Promise<HomeStayCollection[]> => {
    return request<HomeStayCollection[]>('/home/stay-collections');
  },
};
