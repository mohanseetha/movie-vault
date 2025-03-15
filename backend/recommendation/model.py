import numpy as np
from .utils import prepare_matrices, jaccard_similarity
from config import df

cosine_sim_overview, cosine_sim_keywords = prepare_matrices(df)

def clean_text(data):
    return ' '.join([str(item).lower().replace(" ", "") for item in data if item]) if data else ""

def get_recommendations(movie, top_n=8, user_based=False):
    try:
        if not isinstance(movie, dict):
            raise ValueError("Invalid movie data format")

        genres = clean_text([g.get('name', '') for g in movie.get('genres', [])])
        keywords = clean_text([k.get('name', '') for k in movie.get('keywords', [])])
        overview = movie.get('overview', "") or ""
        production_countries = clean_text([c.get('name', '') for c in movie.get('production_countries', [])])
        spoken_languages = clean_text([l.get('name', '') for l in movie.get('spoken_languages', [])])  # noqa: E741
        movie_title = movie.get('title', "").strip().lower()

        query_features = f"{genres} {keywords} {overview} {production_countries} {spoken_languages}"
        if not query_features.strip():
            return []

        similarity_scores = cosine_sim_overview @ cosine_sim_overview.T if user_based else cosine_sim_overview

        combined_scores = []
        for idx in range(len(df)):
            score = (
                0.25 * similarity_scores[idx].max() +
                0.2 * cosine_sim_keywords[idx].max() +
                0.25 * jaccard_similarity(set(df.iloc[idx].get('genres', [])), set(genres.split())) +
                0.2 * jaccard_similarity(set(df.iloc[idx].get('production_countries', [])), set(production_countries.split())) +
                0.1 * jaccard_similarity(set(df.iloc[idx].get('spoken_languages', [])), set(spoken_languages.split()))
            )
            combined_scores.append(score)

        sorted_indices = np.argsort(combined_scores)[::-1]

        if movie_title in df['title_lower'].values:
            movie_index = df[df['title_lower'] == movie_title].index[0]
            sorted_indices = [idx for idx in sorted_indices if idx != movie_index]

        recommended_ids = []
        genre_matched = set()

        for idx in sorted_indices:
            recommended_id = str(df.iloc[idx].get('id', ''))
            movie_genres = set(df.iloc[idx].get('genres', []))

            if len(genre_matched) < 4 or len(genre_matched & movie_genres) > 0:
                recommended_ids.append(recommended_id)
                genre_matched.update(movie_genres)

            if len(recommended_ids) >= top_n:
                break

        return recommended_ids

    except ValueError as ve:
        print(f"ValueError in get_recommendations: {ve}")
        return []
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        return []
