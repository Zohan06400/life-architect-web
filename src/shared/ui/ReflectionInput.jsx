import React from 'react';

// Reflection input with voice recording option
export const ReflectionInput = ({ question, description, placeholder, icon, defaultValue, onBlurSave, onValueChange }) => {
    const textareaRef = React.useRef(null);
    const [isRecording, setIsRecording] = React.useState(false);
    const [speechSupported, setSpeechSupported] = React.useState(true);
    const recognitionRef = React.useRef(null);

    // Check if speech recognition is supported
    React.useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setSpeechSupported(!!SpeechRecognition);
    }, []);

    // Update the textarea value when defaultValue changes (date switch)
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.value = defaultValue || '';
        }
    }, [defaultValue]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
        };
    }, []);

    const startRecording = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsRecording(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;

                if (textareaRef.current && transcript) {
                    const currentValue = textareaRef.current.value;
                    const newValue = currentValue ? currentValue + ' ' + transcript : transcript;
                    textareaRef.current.value = newValue;
                    if (onValueChange) onValueChange(newValue);
                    if (onBlurSave) onBlurSave(newValue);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);

                switch (event.error) {
                    case 'not-allowed':
                    case 'permission-denied':
                        alert('Microphone access was denied. Please allow microphone access and try again.');
                        break;
                    case 'no-speech':
                        alert('No speech was detected. Please try again.');
                        break;
                    case 'network':
                        alert('Network error occurred. Please check your connection.');
                        break;
                    case 'aborted':
                        // User aborted, no alert needed
                        break;
                    default:
                        alert('Speech recognition error: ' + event.error);
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (error) {
            console.error('Error starting speech recognition:', error);
            setIsRecording(false);
            alert('Could not start speech recognition: ' + error.message);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        }
        setIsRecording(false);
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                    <span className="text-lg">{icon}</span>
                </div>
                <h3 className="text-slate-200 font-medium text-sm flex-1">{question}</h3>

                {/* Voice input button - only show if supported */}
                {speechSupported && (
                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording
                            ? 'bg-rose-500/30 text-rose-400 ring-2 ring-rose-500/50'
                            : 'bg-white/10 text-slate-400 hover:bg-purple-500/20 hover:text-purple-400'
                            }`}
                        title={isRecording ? "Stop recording" : "Start voice input"}
                    >
                        {isRecording ? (
                            <div className="w-4 h-4 rounded-sm bg-rose-400 animate-pulse"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Description / Subtext */}
            {description && (
                <div className="mb-3 px-1">
                    <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line border-l-2 border-slate-700/50 pl-3 italic">
                        {description}
                    </p>
                </div>
            )}

            <textarea
                ref={textareaRef}
                defaultValue={defaultValue}
                onBlur={(e) => onBlurSave(e.target.value)}
                placeholder={isRecording ? "🎤 Listening... speak now" : placeholder}
                rows={2}
                className={`w-full px-3 py-2.5 bg-white/5 border rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 outline-none transition-colors text-slate-200 placeholder:text-slate-500 resize-none text-sm ${isRecording ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10'
                    }`}
            />

            {isRecording && (
                <div className="mt-2 flex items-center gap-2 text-rose-400 text-xs">
                    <span className="flex gap-1">
                        <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse"></span>
                        <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                    <span>Listening... speak then tap to stop</span>
                </div>
            )}
        </div>
    );
};
