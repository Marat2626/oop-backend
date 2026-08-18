export interface Social {
  id: string;
  name: string;
  url: string;
  icon: string | null;
}

export interface SocialFormData {
  name: string;
  url: string;
  icon: string;
}
