import { Game, useGameContext } from '@/app/singleplayer/context';
import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Nunito, Orbitron } from 'next/font/google';
import { Crown, Frown, Lightbulb } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type GameStage = 'instructions' | 'game-active' | 'game-ended';
type QuestionStatus = 'correct' | 'incorrect' | 'unanswered' | 'not-answered-yet';

type UnscrambleQuestion = {
    word: string;
    scrambledWord: string;
    hintUsed: boolean;
    status: QuestionStatus;
    letterColors: string[];
};

type UnscrambleGame = {
    stage: GameStage;
    questionNum: number;
    quizStatus: QuestionStatus[];
    currentQuestion: UnscrambleQuestion | null;
    gameWon: boolean;
    millisecondsLeft: number;
    hintsLeft: number;
};

const nunitoBold = Nunito({ weight: '900', subsets: ['latin'] });
const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const WordUnscramble = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const [fadeQuestion, setFadeQuestion] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<'correct' | 'incorrect' | 'unanswered'>('unanswered');
    const [response, setResponse] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);
    const timePerQuestion = 10000;
    const numQuestions = 8;
    const threshold = 6;
    const [unscrambleGame, setUnscrambleGame] = useState<UnscrambleGame>({
        stage: 'instructions',
        questionNum: 1,
        millisecondsLeft: timePerQuestion,
        currentQuestion: null,
        gameWon: false,
        quizStatus: new Array(numQuestions).fill('not-answered-yet'),
        hintsLeft: 3,
    });
    let wordPool: { word: string; used: boolean }[] = [
        'amino',
        'anion',
        'artery',
        'axon',
        'biome',
        'blood',
        'bone',
        'brain',
        'bronchi',
        'cell',
        'colon',
        'cortex',
        'cranial',
        'cytosol',
        'enzyme',
        'exon',
        'femur',
        'fibula',
        'flagella',
        'fungus',
        'gamete',
        'gene',
        'genome',
        'glucose',
        'helix',
        'immune',
        'intron',
        'kidney',
        'larynx',
        'ligand',
        'lipid',
        'liver',
        'lumen',
        'lymph',
        'lysosome',
        'medulla',
        'meiosis',
        'molar',
        'muscle',
        'mutant',
        'myelin',
        'nasal',
        'neuron',
        'organ',
        'oxygen',
        'pancreas',
        'pelvic',
        'peptide',
        'phylum',
        'plasma',
        'protein',
        'radial',
        'retina',
        'ribose',
        'solute',
        'somatic',
        'spinal',
        'starch',
        'sucrose',
        'synapse',
        'system',
        'thyroid',
        'tibia',
        'tissue',
        'trachea',
        'vertebra',
        'virus',
    ].map((word) => {
        return { word, used: false };
    });

    const generateNewWord = (wordLength: number): { word: string; scrambledWord: string } => {
        const shuffle = (array: string[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const pool = wordPool.filter(({ word, used }) => word.length === wordLength && !used);
        const word = pool[Math.floor(Math.random() * pool.length)].word.toUpperCase();
        const scrambledWord = shuffle(Array.from(word.toUpperCase())).join().replaceAll(',', '').toUpperCase();

        return { word, scrambledWord };
    };

    useEffect(() => {
        if (unscrambleGame.stage === 'game-active') {
            if (unscrambleGame.quizStatus[numQuestions - 1] !== 'not-answered-yet') {
                const gameWon = unscrambleGame.quizStatus.filter((status) => status === 'correct').length >= threshold;

                setUnscrambleGame((prev) => {
                    return {
                        ...prev,
                        gameWon: gameWon,
                        stage: 'game-ended',
                    };
                });
            }

            let intervalNum = 0;
            const interval = setInterval(() => {
                setUnscrambleGame((prev) => {
                    if (prev.millisecondsLeft <= 0) {
                        clearInterval(interval);
                        if (intervalNum % 2 === 0 && correctAnswer === 'unanswered' && unscrambleGame.stage === 'game-active') {
                            intervalNum++;
                            if (!submitted) handleSubmit();
                        }

                        return { ...prev, millisecondsLeft: 0 };
                    }
                    return { ...prev, millisecondsLeft: prev.millisecondsLeft - 10 };
                });
            }, 10);

            return () => clearInterval(interval);
        }

        if (unscrambleGame.stage === 'game-ended') {
            const gameWon = unscrambleGame.quizStatus.filter((status) => status === 'correct').length >= threshold;

            setGame((prev: Game) => {
                return {
                    ...prev,
                    game: gameWon
                        ? {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'word-unscramble'),
                              gamesWon: [...prev.game.gamesWon, { name: 'word-unscramble', roundNum: prev.game.number }],
                          }
                        : {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'word-unscramble'),
                              gamesLost: [...prev.game.gamesLost, { name: 'word-unscramble', roundNum: prev.game.number }],
                          },
                };
            });
        }
    }, [unscrambleGame]);

    const wordLength = (questionNum: number): number => {
        switch (true) {
            case questionNum === 1:
                return 4;
            case questionNum >= 2 && questionNum <= 3:
                return 5;
            case questionNum >= 4 && questionNum <= 5:
                return 6;
            case questionNum >= 6 && questionNum <= numQuestions:
                return 7;
            default:
                return 6;
        }
    };
    const getLetterColors = (scrambled: string, original: string): string[] => {
        const colors: string[] = [];
        const matchedIndices: boolean[] = new Array(original.length).fill(false);

        let hintCount = 0;

        for (let i = 0; i < scrambled.length; i++) {
            const letter = scrambled[i];

            let isHint = false;
            for (let j = 0; j < 3; j++) {
                if (original[j] === letter && !matchedIndices[j] && hintCount < 3) {
                    isHint = true;
                    matchedIndices[j] = true;
                    hintCount++;
                    break;
                }
            }

            colors.push(isHint ? 'text-green-400' : 'text-white');
        }

        return colors;
    };

    const handleSubmit = () => {
        if ((response === '' && unscrambleGame.millisecondsLeft > 0) || submitted) return;
        setSubmitted(true);
        const correct = response === unscrambleGame.currentQuestion?.word ? 'correct' : 'incorrect';
        setCorrectAnswer(correct);

        setTimeout(() => {
            setFadeQuestion(true);
            setTimeout(() => {
                setUnscrambleGame((prev) => {
                    const quizStatus = [...prev.quizStatus];
                    quizStatus[unscrambleGame.questionNum - 1] = correct;

                    wordPool = wordPool.map(({ word, used }) =>
                        word.toUpperCase() === unscrambleGame.currentQuestion?.word.toUpperCase() ? { word, used: true } : { word, used: false }
                    );
                    const { word, scrambledWord } = generateNewWord(wordLength(prev.questionNum + 1));

                    return {
                        ...prev,
                        quizStatus: [...quizStatus],
                        millisecondsLeft: timePerQuestion,
                        questionNum: prev.questionNum + 1,
                        currentQuestion: {
                            word,
                            scrambledWord,
                            letterColors: getLetterColors(scrambledWord, word),
                            status: 'not-answered-yet',
                        },
                    } as UnscrambleGame;
                });
                setCorrectAnswer('unanswered');
                setResponse('');
                setFadeQuestion(false);
                setSubmitted(false);
            }, 750);
        }, 500);
    };

    return (
        <>
            <div className='w-full h-full flex flex-col gap-3'>
                <span className='flex justify-between items-start relative'>
                    <h3 className={`${audiowide.className} text-3xl width-laptop:text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                    {unscrambleGame.stage !== 'instructions' && (
                        <div className={`${orbitronSemibold.className} flex flex-col absolute right-0`}>
                            <span className='flex gap-2'>
                                {unscrambleGame.quizStatus.map((status, index) => (
                                    <div
                                        key={status + index}
                                        className={`${
                                            status === 'correct' ? 'bg-green-400' : status === 'incorrect' || status === 'unanswered' ? ' bg-red-400' : 'bg-gray-400'
                                        } w-6 h-6 border-2 border-white shadow-lg rounded-full`}
                                    />
                                ))}
                            </span>
                            <span></span>
                        </div>
                    )}
                </span>
                <AnimatePresence>
                    {unscrambleGame.stage === 'instructions' && (
                        <div className='w-full h-full flex flex-col gap-4 width-laptop:gap-6 items-center justify-center'>
                            <span className='flex'>
                                <span
                                    className={`${nunitoBold.className} text-5xl width-laptop:text-6xl grid place-items-center mt-4 mr-8 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-3 width-laptop:p-4`}
                                >
                                    A
                                </span>
                                <span
                                    className={`${nunitoBold.className} text-5xl width-laptop:text-6xl grid place-items-center mt-7 mr-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-3 width-laptop:p-4`}
                                >
                                    B
                                </span>
                                <span
                                    className={`${nunitoBold.className} text-5xl width-laptop:text-6xl grid place-items-center -mt-3 mr-6 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-3 width-laptop:p-4`}
                                >
                                    C
                                </span>
                                <span
                                    className={`${nunitoBold.className} text-5xl width-laptop:text-6xl grid place-items-center mt-7 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-3 width-laptop:p-4`}
                                >
                                    E
                                </span>
                                <span
                                    className={`${nunitoBold.className} text-5xl width-laptop:text-6xl grid place-items-center mt-3 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-3 width-laptop:p-4`}
                                >
                                    F
                                </span>
                                <span
                                    className={`${nunitoBold.className} text-5xl width-laptop:text-6xl grid place-items-center -mt-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-3 width-laptop:p-4`}
                                >
                                    D
                                </span>
                            </span>
                            <span className={`${orbitronSemibold.className} width-laptop:w-[70%] w-[85%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span>In this minigame, you will have to unscramble various biology words.</span>
                                <span>
                                    There will be {numQuestions} questions. You will have <span className={orbitronBold.className}>{timePerQuestion / 1000} seconds</span> for each
                                    question, and you must get at least {threshold} of the questions correct. However, you are given 3 hints, which reveal the first 3 letters of the
                                    unscrambled word. Use them wisely!
                                </span>
                                <span>If you fail to get {threshold} questions correct, the CPU will take your attack!</span>
                            </span>
                            <button
                                onClick={() => {
                                    setUnscrambleGame((prev) => {
                                        const { word, scrambledWord } = generateNewWord(wordLength(unscrambleGame.questionNum));

                                        return {
                                            ...prev,
                                            stage: 'game-active',
                                            currentQuestion: {
                                                word,
                                                scrambledWord,
                                                letterColors: getLetterColors(scrambledWord, word),
                                                status: 'not-answered-yet',
                                            },
                                        } as UnscrambleGame;
                                    });
                                }}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                BEGIN!
                            </button>
                        </div>
                    )}
                    {unscrambleGame.stage === 'game-active' && unscrambleGame.currentQuestion !== null && (
                        <div className='w-full h-full flex items-center justify-center'>
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: fadeQuestion ? 0 : 1 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className='h-full w-3/4 flex flex-col justify-center items-center gap-5 width-laptop:gap-8'
                            >
                                <div
                                    className={`${nunitoBold.className} ${
                                        correctAnswer === 'correct'
                                            ? 'bg-green-400 bg-opacity-80'
                                            : correctAnswer === 'incorrect'
                                            ? 'bg-red-400 bg-opacity-80'
                                            : 'bg-[rgba(255,255,255,.4)]'
                                    } text-white w-28 h-28 text-6xl width-laptop:w-32 width-laptop:h-32 width-laptop:text-7xl border-[6px] shadow-2xl border-transparent rounded-full grid place-items-center relative transition-all`}
                                >
                                    <span>{unscrambleGame.questionNum}</span>
                                    <div
                                        className='absolute -top-[6px] -left-[6px] w-28 h-28 width-laptop:w-32 width-laptop:h-32 rounded-full z-10'
                                        style={{
                                            background: `conic-gradient(transparent ${100 - (unscrambleGame.millisecondsLeft / timePerQuestion) * 100}%, #fff ${
                                                100 - (unscrambleGame.millisecondsLeft / timePerQuestion) * 100
                                            }%)`,
                                            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
                                            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
                                        }}
                                    ></div>
                                </div>
                                <h4 className={`${orbitronBold.className} text-2xl width-laptop:text-3xl text-center`}>
                                    {Array.from(unscrambleGame.currentQuestion.scrambledWord).map((letter, index) => {
                                        return (
                                            <span
                                                key={letter + index}
                                                className={`${unscrambleGame.currentQuestion?.hintUsed ? unscrambleGame.currentQuestion?.letterColors[index] : 'text-white'}`}
                                            >
                                                {letter}
                                            </span>
                                        );
                                    })}
                                </h4>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!submitted) {
                                            handleSubmit();
                                        }
                                    }}
                                    className='grid place-items-center w-full gap-3'
                                >
                                    <div className='w-full h-full flex justify-center'>
                                        <div className='relative whitespace-nowrap flex items-center w-1/2'>
                                            <textarea
                                                onChange={(e) => {
                                                    if (unscrambleGame.millisecondsLeft > 0) setResponse(e.target.value.toUpperCase());
                                                }}
                                                value={response.toUpperCase()}
                                                autoFocus
                                                rows={1}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (!submitted) {
                                                            handleSubmit();
                                                        }
                                                    }
                                                }}
                                                className={`${orbitronBold.className} outline-none flex-1 text-lg py-2.5 width-laptop:text-xl width-laptop:py-4 w-full bg-white bg-opacity-80 rounded-full shadow-lg border-4 border-[#5b8ad0] text-center text-[#5b8ad0] resize-none`}
                                            ></textarea>
                                            <div
                                                className='absolute left-5 w-6 h-6 width-laptop:w-8 width-laptop:h-8 cursor-pointer'
                                                onClick={() => {
                                                    if (unscrambleGame.hintsLeft > 0 && !unscrambleGame.currentQuestion?.hintUsed) {
                                                        setUnscrambleGame((prev) => {
                                                            return {
                                                                ...prev,
                                                                hintsLeft: prev.hintsLeft - 1,
                                                                currentQuestion: {
                                                                    ...prev.currentQuestion,
                                                                    hintUsed: true,
                                                                },
                                                            } as UnscrambleGame;
                                                        });
                                                        setResponse((prev) => (unscrambleGame.currentQuestion ? unscrambleGame.currentQuestion.word.substring(0, 3) : prev));
                                                    }
                                                }}
                                            >
                                                <div className='relative w-full h-full'>
                                                    <Lightbulb className='text-[#5b8ad0] w-6 h-6 width-laptop:w-8 width-laptop:h-8 absolute' />
                                                    <div
                                                        className={`${orbitronSemibold.className} text-[8px] width-laptop:text-[10px] absolute w-3 h-3 width-laptop:w-4 width-laptop:h-4 rounded-full grid place-items-center shadow-xl -right-2 -bottom-2 bg-[#5b8ad0]`}
                                                    >
                                                        {unscrambleGame.hintsLeft}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type='submit'
                                        className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                                    >
                                        SUBMIT
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                    {unscrambleGame.stage === 'game-ended' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full flex flex-col items-center justify-center gap-4 select-none'
                        >
                            {unscrambleGame.gameWon ? (
                                <Crown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} />
                            ) : (
                                <Frown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} />
                            )}
                            <span className={`${orbitronSemibold.className} w-[65%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span className='text-lg width-laptop:text-xl'>You {unscrambleGame.gameWon ? 'won' : 'lost'}!</span>
                                <span>
                                    You got {unscrambleGame.quizStatus.filter((status) => status === 'correct').length} out of {numQuestions} questions correct!
                                </span>
                                <span>
                                    {unscrambleGame.gameWon
                                        ? `This was above the threshold to win! Click the "ATTACK" button below to launch an attack on the CPU!`
                                        : `This was below the threshold to win. Click the "CONCEDE" button below to accept the attack of the CPU on you.`}
                                </span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                {unscrambleGame.gameWon ? 'ATTACK!' : 'CONCEDE'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default WordUnscramble;
