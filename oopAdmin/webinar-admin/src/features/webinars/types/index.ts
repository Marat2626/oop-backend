export interface VideoLink {
  label: string;
  url: string;
}

export interface WebinarExpert {
  id: number | string;
  name: string;
  photo?: string | null;
  position?: string | null;
  organization?: string | null;
}

export interface WebinarApi {
  id: number | string;
  title: string;
  description: string;
  start_time: string;
  end_time?: string | null;
  duration?: string | null;
  talk_points?: string[];
  video_links?: VideoLink[];
  expert_id?: number | null;
  rubric_ids?: number[];
  rubrics?: { id: number; name: string }[];
  expert?: WebinarExpert | null;
  stream_url?: string;
  question_url?: string;
  photo?: string;
  preview?: string;
  is_published: boolean;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  end_date: string;
  end_time: string;
  duration: string;
  talk_points: string[];
  video_links: VideoLink[];
  expert_id: string;
  expert_name: string;
  rubric_ids: number[];
  stream_url: string;
  question_url: string;
  photo: string;
  preview: string;
  is_published: boolean;
}

export interface WebinarFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  end_date: string;
  end_time: string;
  duration: string;
  talk_points: string[];
  video_links: VideoLink[];
  expert_id: string;
  rubric_ids: number[];
  stream_url: string;
  question_url: string;
  photo: string;
  preview: string;
  is_published: boolean;
}
