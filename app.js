// Emotion Detection App JavaScript

// Application data
const emotionData = {
    emotions: ["sadness", "joy", "love", "anger", "fear", "surprise"],
    emotionColors: {
        "sadness": "#4A90E2",
        "joy": "#F5A623", 
        "love": "#D0021B",
        "anger": "#B22222",
        "fear": "#7B68EE",
        "surprise": "#50E3C2"
    },
    sampleTexts: [
        { text: "I am so happy and excited about this new opportunity!", emotion: "joy" },
        { text: "I feel really sad and lonely today", emotion: "sadness" },
        { text: "I love you so much, you mean everything to me", emotion: "love" },
        { text: "I am so angry and frustrated with this situation", emotion: "anger" },
        { text: "I'm scared and worried about what might happen", emotion: "fear" },
        { text: "Wow, that was completely unexpected and surprising!", emotion: "surprise" },
        { text: "Today was an amazing day filled with joy and laughter", emotion: "joy" },
        { text: "I'm feeling overwhelmed and anxious about the exam", emotion: "fear" },
        { text: "She surprised me with the most wonderful gift", emotion: "surprise" },
        { text: "I miss my family so much it hurts", emotion: "sadness" }
    ]
};

// Emotion detection keywords for realistic prediction
const emotionKeywords = {
    joy: ["happy", "excited", "amazing", "wonderful", "great", "fantastic", "awesome", "delighted", "thrilled", "cheerful", "joyful", "elated", "ecstatic", "blissful", "euphoric", "laugh", "smile", "celebration", "success", "victory", "achievement"],
    sadness: ["sad", "lonely", "depressed", "disappointed", "hurt", "heartbroken", "grief", "sorrow", "melancholy", "down", "blue", "miserable", "devastated", "tears", "cry", "miss", "lost", "empty", "hopeless", "despair"],
    love: ["love", "adore", "cherish", "affection", "romance", "romantic", "darling", "sweetheart", "beloved", "treasure", "precious", "heart", "soul", "forever", "always", "kiss", "hug", "marry", "wedding", "valentine"],
    anger: ["angry", "mad", "furious", "frustrated", "irritated", "annoyed", "rage", "hate", "disgusted", "outraged", "livid", "fuming", "pissed", "infuriated", "resentful", "bitter", "hostile", "aggressive", "violent", "fight"],
    fear: ["scared", "afraid", "terrified", "worried", "anxious", "nervous", "panic", "frightened", "fearful", "concerned", "stressed", "overwhelmed", "intimidated", "threatened", "alarmed", "uneasy", "apprehensive", "dread", "horror", "phobia"],
    surprise: ["surprised", "unexpected", "shocking", "amazed", "astonished", "stunned", "bewildered", "confused", "wow", "incredible", "unbelievable", "remarkable", "extraordinary", "sudden", "spontaneous", "caught off guard", "taken aback", "flabbergasted", "astounded", "dumbfounded"]
};

// DOM elements
let textInput, analyzeBtn, resultsSection, primaryResult, confidenceBars, samplesGrid;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    renderSampleTexts();
});

function initializeElements() {
    textInput = document.getElementById('textInput');
    analyzeBtn = document.getElementById('analyzeBtn');
    resultsSection = document.getElementById('resultsSection');
    primaryResult = document.getElementById('primaryResult');
    confidenceBars = document.getElementById('confidenceBars');
    samplesGrid = document.getElementById('samplesGrid');
}

function setupEventListeners() {
    analyzeBtn.addEventListener('click', analyzeEmotion);
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            analyzeEmotion();
        }
    });
}

function renderSampleTexts() {
    samplesGrid.innerHTML = '';
    
    emotionData.sampleTexts.forEach((sample, index) => {
        const sampleCard = document.createElement('div');
        sampleCard.className = 'sample-card';
        sampleCard.innerHTML = `
            <div class="sample-text">"${sample.text}"</div>
            <div class="sample-emotion">Expected: ${sample.emotion}</div>
        `;
        
        sampleCard.addEventListener('click', () => {
            textInput.value = sample.text;
            textInput.focus();
            // Auto-analyze after a short delay
            setTimeout(() => {
                analyzeEmotion();
            }, 500);
        });
        
        samplesGrid.appendChild(sampleCard);
    });
}

function analyzeEmotion() {
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze.');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Simulate processing delay for realism
    setTimeout(() => {
        const predictions = predictEmotion(text);
        displayResults(predictions);
        hideLoadingState();
    }, 1500);
}

function showLoadingState() {
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    
    btnText.textContent = 'Analyzing...';
    btnLoader.classList.remove('hidden');
    analyzeBtn.disabled = true;
}

function hideLoadingState() {
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    
    btnText.textContent = 'Analyze Emotion';
    btnLoader.classList.add('hidden');
    analyzeBtn.disabled = false;
}

function predictEmotion(text) {
    const lowercaseText = text.toLowerCase();
    const words = lowercaseText.split(/\W+/);
    
    // Initialize scores
    const scores = {};
    emotionData.emotions.forEach(emotion => {
        scores[emotion] = 0;
    });
    
    // Analyze text for emotion keywords
    words.forEach(word => {
        Object.keys(emotionKeywords).forEach(emotion => {
            if (emotionKeywords[emotion].includes(word)) {
                scores[emotion] += 1;
            }
        });
    });
    
    // Add some context-based scoring
    addContextualScoring(lowercaseText, scores);
    
    // Normalize and add base probability
    const baseProb = 0.05; // Minimum probability for each emotion
    let totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) {
        // If no keywords found, distribute somewhat evenly with slight bias
        scores.joy = 0.3;
        scores.surprise = 0.25;
        scores.sadness = 0.15;
        scores.fear = 0.15;
        scores.anger = 0.1;
        scores.love = 0.05;
    } else {
        // Convert to probabilities
        Object.keys(scores).forEach(emotion => {
            scores[emotion] = (scores[emotion] / totalScore) * 0.8 + baseProb;
        });
        
        // Normalize to sum to 1
        const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
        Object.keys(scores).forEach(emotion => {
            scores[emotion] = scores[emotion] / total;
        });
    }
    
    // Add some realistic noise
    Object.keys(scores).forEach(emotion => {
        const noise = (Math.random() - 0.5) * 0.1; // ±5% noise
        scores[emotion] = Math.max(0.01, Math.min(0.95, scores[emotion] + noise));
    });
    
    // Re-normalize after noise
    const finalTotal = Object.values(scores).reduce((sum, score) => sum + score, 0);
    Object.keys(scores).forEach(emotion => {
        scores[emotion] = scores[emotion] / finalTotal;
    });
    
    return scores;
}

function addContextualScoring(text, scores) {
    // Question marks suggest surprise or curiosity
    if (text.includes('?')) {
        scores.surprise += 0.5;
    }
    
    // Exclamation marks can indicate various strong emotions
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 0) {
        scores.joy += exclamationCount * 0.3;
        scores.anger += exclamationCount * 0.2;
        scores.surprise += exclamationCount * 0.2;
    }
    
    // All caps suggests strong emotion (usually anger or excitement)
    if (text === text.toUpperCase() && text.length > 3) {
        scores.anger += 0.4;
        scores.joy += 0.2;
    }
    
    // Negation words
    const negationWords = ['not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor', 'hardly', 'scarcely', 'barely'];
    const hasNegation = negationWords.some(word => text.includes(word));
    if (hasNegation) {
        scores.sadness += 0.3;
        scores.anger += 0.2;
    }
    
    // Length-based adjustments
    if (text.length > 100) {
        // Longer texts might be more analytical or storytelling
        scores.surprise += 0.1;
        scores.joy += 0.1;
    }
}

function displayResults(predictions) {
    // Find the primary emotion
    const primaryEmotion = Object.keys(predictions).reduce((a, b) => 
        predictions[a] > predictions[b] ? a : b
    );
    const primaryConfidence = predictions[primaryEmotion];
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Display primary result
    primaryResult.innerHTML = `
        <div class="primary-emotion">${primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1)}</div>
        <div class="primary-confidence">${(primaryConfidence * 100).toFixed(1)}% Confidence</div>
    `;
    
    // Display confidence bars
    displayConfidenceBars(predictions);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayConfidenceBars(predictions) {
    confidenceBars.innerHTML = '';
    
    // Sort emotions by confidence (descending)
    const sortedEmotions = Object.keys(predictions).sort((a, b) => predictions[b] - predictions[a]);
    
    sortedEmotions.forEach((emotion, index) => {
        const confidence = predictions[emotion];
        const percentage = (confidence * 100).toFixed(1);
        
        const barElement = document.createElement('div');
        barElement.className = 'confidence-bar';
        barElement.innerHTML = `
            <div class="emotion-label">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
            <div class="bar-container">
                <div class="bar-fill emotion-${emotion}" style="width: 0%;"></div>
            </div>
            <div class="confidence-percentage">${percentage}%</div>
        `;
        
        confidenceBars.appendChild(barElement);
        
        // Animate the bar fill
        setTimeout(() => {
            const barFill = barElement.querySelector('.bar-fill');
            barFill.style.width = `${percentage}%`;
        }, index * 100 + 200); // Stagger the animations
    });
}

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click-to-copy functionality for sample texts
    const sampleCards = document.querySelectorAll('.sample-card');
    sampleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to analyze
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (textInput.value.trim()) {
                analyzeEmotion();
            }
        }
        
        // Escape to clear input
        if (e.key === 'Escape') {
            textInput.value = '';
            textInput.focus();
            resultsSection.classList.add('hidden');
        }
    });
    
    // Add performance monitoring simulation
    let analysisCount = 0;
    const originalAnalyze = analyzeEmotion;
    
    window.analyzeEmotion = function() {
        analysisCount++;
        console.log(`Analysis #${analysisCount} - Text length: ${textInput.value.length} characters`);
        originalAnalyze();
    };
});

// Add some utility functions for enhanced UX
function highlightText(element, duration = 2000) {
    element.style.background = 'rgba(33, 128, 141, 0.1)';
    element.style.transition = 'background 0.3s ease';
    
    setTimeout(() => {
        element.style.background = '';
    }, duration);
}

function showToast(message, type = 'info') {
    // Simple toast notification system
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: var(--color-${type === 'error' ? 'error' : 'success'});
        color: white;
        border-radius: 8px;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Export for potential future use
window.EmotionDetector = {
    analyze: analyzeEmotion,
    predict: predictEmotion,
    emotions: emotionData.emotions,
    colors: emotionData.emotionColors
};