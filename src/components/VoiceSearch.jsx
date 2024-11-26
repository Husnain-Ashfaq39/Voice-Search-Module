import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import './VoiceSearch.css';

const VoiceSearch = ({ onSearch, onCommand, onConfidence }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);

  // Online audio file URLs for start and stop sounds
  const startSoundUrl = 'https://www.soundjay.com/buttons/sounds/button-3.mp3'; // Example start sound
  const stopSoundUrl = 'https://www.soundjay.com/buttons/sounds/button-10.mp3'; // Example stop sound

  // References to audio elements
  const startSoundRef = useRef(null);
  const stopSoundRef = useRef(null);

  useEffect(() => {
    // Initialize audio elements with online URLs
    startSoundRef.current = new Audio(startSoundUrl);
    stopSoundRef.current = new Audio(stopSoundUrl);

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Your browser does not support Speech Recognition.');
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // Enable interim results
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    // Event handlers
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
          setTranscript(final);
          if (onSearch) {
            onSearch(final);
          }
          // Speak back the transcript
          speakText(final);
          // Handle voice commands
          if (onCommand) {
            onCommand(final);
          }
          // Send confidence score
          if (onConfidence) {
            onConfidence(result[0].confidence);
          }
        } else {
          interim += result[0].transcript;
          setInterimTranscript(interim);
          // Send confidence score for interim results if needed
        }
      }
    };

    recognition.onerror = (event) => {
      let message;
      switch (event.error) {
        case 'no-speech':
          message = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          message = 'No microphone was found. Please ensure that a microphone is connected.';
          break;
        case 'not-allowed':
          message = 'Permission to use microphone was denied.';
          break;
        default:
          message = `Error occurred in recognition: ${event.error}`;
      }
      setError(message);
      setIsListening(false);
      // Play stop sound on error
      playStopSound();
    };

    recognition.onend = () => {
      setIsListening(false);
      // Play stop sound when recognition ends
      playStopSound();
    };

    // Cleanup on unmount
    return () => {
      recognition.abort();
    };
  }, [onSearch, onCommand, onConfidence, startSoundUrl, stopSoundUrl]);

  const startListening = () => {
    if (recognitionRef.current) {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
        // Play start sound
        playStartSound();
      } catch (e) {
        // Handle error if recognition is already started
        console.error('Recognition already started', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Play stop sound
      playStopSound();
    }
  };

  const playStartSound = () => {
    if (startSoundRef.current) {
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play().catch((e) => console.error('Error playing start sound', e));
    }
  };

  const playStopSound = () => {
    if (stopSoundRef.current) {
      stopSoundRef.current.currentTime = 0;
      stopSoundRef.current.play().catch((e) => console.error('Error playing stop sound', e));
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis not supported in this browser.');
    }
  };

  return (
    <motion.div 
      className="voice-search"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className={`mic-button ${isListening ? 'listening' : ''}`}
        aria-pressed={isListening}
        aria-label={isListening ? 'Stop Voice Search' : 'Start Voice Search'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? { boxShadow: '0 0 0 0 rgba(40, 167, 69, 1)' } : {}}
        transition={isListening ? {
          repeat: Infinity,
          duration: 1,
          ease: 'easeInOut',
        } : {}}
      >
        {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />} 
        {isListening ? 'Stop Listening' : 'Start Voice Search'}
      </motion.button>
      
      <AnimatePresence>
        {isListening && (
          <motion.span 
            className="listening-indicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            🎤 Listening...
          </motion.span>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="transcript-container"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
      >
        {transcript && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <strong>Final Transcript:</strong> {transcript}
          </motion.p>
        )}
        {interimTranscript && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <em>Interim Transcript:</em> {interimTranscript}
          </motion.p>
        )}
      </motion.div>
      
      <AnimatePresence>
        {confidence > 0 && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            Confidence: {(confidence * 100).toFixed(2)}%
          </motion.p>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <motion.p 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VoiceSearch;
