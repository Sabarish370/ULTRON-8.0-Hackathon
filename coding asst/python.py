import pyaudio
import wave
import librosa
import numpy as np
import speech_recognition as sr
import nltk
nltk.download()
from nltk.sentiment import SentimentIntensityAnalyzer
from scipy.signal import find_peaks
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

# 1. Record Audio
def record_audio(filename='audio.wav', duration=5, rate=44100):
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=rate, input=True, frames_per_buffer=1024)
    frames = []
    print("Recording...")
    for _ in range(0, int(rate / 1024 * duration)):
        frames.append(stream.read(1024))
    print("Recording Stopped.")
    stream.stop_stream()
    stream.close()
    p.terminate()
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(p.get_sample_size(pyaudio.paInt16))
        wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

# 2. Extract Features
def extract_features(filename):
    y, sr = librosa.load(filename, sr=None)
    # Speech Rate
    speech_rate = len(librosa.effects.split(y, top_db=30)) / librosa.get_duration(y, sr)
    # Pitch Variation
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_values = np.mean(pitches[magnitudes > np.median(magnitudes)])
    # Energy
    energy = np.sum(y ** 2) / len(y)
    # Pause Count
    silent_parts = librosa.effects.split(y, top_db=30)
    pauses = len(silent_parts)
    return np.array([speech_rate, pitch_values, energy, pauses])

# 3. Speech-to-Text & Sentiment Analysis
def analyze_sentiment(filename):
    recognizer = sr.Recognizer()
    with sr.AudioFile(filename) as source:
        audio = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio)
        sentiment_score = sia.polarity_scores(text)['compound']
    except:
        text, sentiment_score = "", 0
    return text, sentiment_score

# 4. Train Model
X_train = np.array([[2.3, 150, 0.5, 3], [4.1, 200, 0.8, 1], [1.8, 120, 0.3, 6]])
y_train = np.array([1, 2, 0])  # 0: Sad, 1: Neutral, 2: Stressed
model = make_pipeline(StandardScaler(), SVC(kernel='linear', probability=True))
model.fit(X_train, y_train)

def classify_emotion(features, sentiment):
    prediction = model.predict([features])[0]
    if sentiment < -0.5:
        return "Sad 😔"
    elif prediction == 2:
        return "Stressed 😟"
    return "Neutral 🙂"

# Run Process
record_audio()
features = extract_features("audio.wav")
text, sentiment = analyze_sentiment("audio.wav")
emotion = classify_emotion(features, sentiment)
print(f"Detected Emotion: {emotion}\nText: {text}")