from sklearn.feature_extraction.text import TfidfVectorizer # type: ignore
from sklearn.metrics.pairwise import cosine_similarity # type: ignore

def jaccard_similarity(set1, set2):
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union != 0 else 0

def prepare_matrices(df):
    vectorizer = TfidfVectorizer(stop_words='english')
    
    df = df.copy()
    df['overview'] = df['overview'].fillna('')
    df['keywords'] = df['keywords'].apply(lambda x: ' '.join(x) if isinstance(x, list) else '')

    cosine_sim_overview = cosine_similarity(vectorizer.fit_transform(df['overview']))
    cosine_sim_keywords = cosine_similarity(vectorizer.fit_transform(df['keywords']))

    return cosine_sim_overview, cosine_sim_keywords
