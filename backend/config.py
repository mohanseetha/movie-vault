import joblib # type: ignore

DATA_PATH = './data/movie_data.pkl.gz'
data = joblib.load(DATA_PATH)
df = data['df']