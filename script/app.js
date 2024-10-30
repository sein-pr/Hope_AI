const inputDiv = document.querySelector('.input');
const content = document.querySelector('.content');

function speak(text) {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('female') || voice.name.includes('F') || voice.lang.includes('en-US'));

    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    text_speak.voice = femaleVoice || voices[1];
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    const day = new Date();
    const hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("Good Morning, how can I assist you today?");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon, how may I help you?");
    } else {
        speak("Good Evening, how can I be of service?");
    }
}

window.addEventListener('load', () => {
    speak("Bringing myself back online...");
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.onresult = (event) => {
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript;
        content.textContent = transcript;
        takeCommand(transcript.toLowerCase());
    };

    inputDiv.addEventListener('click', () => {
        content.textContent = "Listening...";
        recognition.start();
    });
} else {
    speak("Sorry, your browser does not support speech recognition.");
}

const apiKey = 'AIzaSyBX0pyNCwRS-kVvUFMAqP4V4ZZLWSqfSgc'; // YouTube API key

function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Sir Prince, How May I Help You?");
    } else if (message.includes("open google")) {
        speak("Sorry, I can't open Google directly.");
    } else if (message.includes("open youtube")) {
        const videoUrl = "https://www.youtube.com/";
        speak("Opening YouTube");
        window.open(videoUrl, "_blank");
    } else if (message.includes("weather")) {
        fetch(`http://api.weatherstack.com/current?access_key=fe5b102523ef46cf0ebb7abeea747952&query=Windhoek`)
            .then(response => response.json())
            .then(data => {
                if (data && data.current) {
                    const temperature = data.current.temperature;
                    const description = data.current.weather_descriptions[0];
                    speak(`The current weather in Windhoek is ${temperature} degrees Celsius with ${description}`);
                } else {
                    speak("Sorry, I couldn't fetch the weather at the moment.");
                }
            })
            .catch(error => speak("Sorry, there was an issue retrieving the weather."));
    } else if (message.includes("news")) {
        speak("Fetching the latest news headlines.");
        fetch(`https://newsapi.org/v2/top-headlines?country=na&apiKey=7cd8eaabf1144b47b929c1f4d227274f`)
            .then(response => response.json())
            .then(data => {
                const headline = data.articles[0]?.title || "No headlines available.";
                speak("Here's the latest headline: " + headline);
            })
            .catch(error => speak("Sorry, I couldn't fetch the news."));
    } else if (message.includes("joke")) {
        const jokes = [
            "Why did the computer go to the doctor? Because it had a virus!",
            "Why do programmers prefer dark mode? Because the light attracts bugs!",
        ];
        speak(jokes[Math.floor(Math.random() * jokes.length)]);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        const finalText = "The current time is " + time;
        speak(finalText);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        const finalText = "Today's date is " + date;
        speak(finalText);
    } else if (message.includes('calculator')) {
        speak("Opening Calculator is not supported by this application.");
    } else if (message.includes('play') && message.includes('on youtube')) {
        const song = message.replace('play', '').replace('on youtube', '').trim();
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(song)}&key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const videoId = data.items[0]?.id?.videoId;
                if (videoId) {
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    speak(`Playing ${song} on YouTube`);
                    window.open(videoUrl, "_blank");
                } else {
                    speak("I couldn't find that song on YouTube.");
                }
            })
            .catch(error => {
                speak("Sorry, I couldn't retrieve the song from YouTube at the moment.");
            });
    } else {
        speak("I'm sorry, I didn't quite catch that. Could you please repeat or try asking in a different way?");
    }
}
