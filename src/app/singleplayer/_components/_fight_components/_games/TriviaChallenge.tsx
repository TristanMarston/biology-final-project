import { Game, useGameContext } from '@/app/singleplayer/context';
import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Nunito, Orbitron } from 'next/font/google';
import { CircleHelp, Clock, Crown, Frown, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type GameStage = 'instructions' | 'game-active' | 'game-ended';
type QuestionStatus = 'correct' | 'incorrect' | 'unanswered' | 'not-answered-yet';

type TriviaQuestionAnswer = {
    answer: string;
    correct: boolean;
    selected: boolean;
};

type TriviaQuestion = {
    question: string;
    answers: { a: TriviaQuestionAnswer; b: TriviaQuestionAnswer; c: TriviaQuestionAnswer; d: TriviaQuestionAnswer };
    status: QuestionStatus;
};

type TriviaGame = {
    stage: GameStage;
    questionNum: number;
    quizStatus: QuestionStatus[];
    currentQuestion: TriviaQuestion | null;
    gameWon: boolean;
    millisecondsLeft: number;
};

const nunitoBold = Nunito({ weight: '900', subsets: ['latin'] });
const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const TriviaChallenge = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const [fadeQuestion, setFadeQuestion] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<'correct' | 'incorrect' | 'unanswered'>('unanswered');
    const [triviaGame, setTriviaGame] = useState<TriviaGame>({
        stage: 'instructions',
        questionNum: 1,
        millisecondsLeft: 10000,
        currentQuestion: null,
        gameWon: false,
        quizStatus: ['not-answered-yet', 'not-answered-yet', 'not-answered-yet', 'not-answered-yet', 'not-answered-yet'],
    });
    const [questionPool, setQuestionPool] = useState<TriviaQuestion[]>([
        {
            question: 'What is the powerhouse of the cell?',
            answers: {
                a: { answer: 'Ribosome', correct: false, selected: false },
                b: { answer: 'Mitochondria', correct: true, selected: false },
                c: { answer: 'Nucleus', correct: false, selected: false },
                d: { answer: 'Golgi Apparatus', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What is the process by which plants make their food?',
            answers: {
                a: { answer: 'Respiration', correct: false, selected: false },
                b: { answer: 'Photosynthesis', correct: true, selected: false },
                c: { answer: 'Fermentation', correct: false, selected: false },
                d: { answer: 'Osmosis', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'Which macromolecule is primarily used for energy in the body?',
            answers: {
                a: { answer: 'Proteins', correct: false, selected: false },
                b: { answer: 'Carbohydrates', correct: true, selected: false },
                c: { answer: 'Lipids', correct: false, selected: false },
                d: { answer: 'Nucleic Acids', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What is the main function of red blood cells?',
            answers: {
                a: { answer: 'Fight infections', correct: false, selected: false },
                b: { answer: 'Transport oxygen', correct: true, selected: false },
                c: { answer: 'Produce antibodies', correct: false, selected: false },
                d: { answer: 'Regulate body temperature', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'Which base pairs with adenine in DNA?',
            answers: {
                a: { answer: 'Cytosine', correct: false, selected: false },
                b: { answer: 'Guanine', correct: false, selected: false },
                c: { answer: 'Thymine', correct: true, selected: false },
                d: { answer: 'Uracil', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What is the primary purpose of meiosis?',
            answers: {
                a: { answer: 'Cell growth', correct: false, selected: false },
                b: { answer: 'Production of gametes', correct: true, selected: false },
                c: { answer: 'Repairing damaged cells', correct: false, selected: false },
                d: { answer: 'Producing energy', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'Which organ filters waste from the blood?',
            answers: {
                a: { answer: 'Liver', correct: false, selected: false },
                b: { answer: 'Lungs', correct: false, selected: false },
                c: { answer: 'Kidneys', correct: true, selected: false },
                d: { answer: 'Pancreas', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What structure regulates what enters and exits the cell?',
            answers: {
                a: { answer: 'Cell Wall', correct: false, selected: false },
                b: { answer: 'Cytoplasm', correct: false, selected: false },
                c: { answer: 'Cell Membrane', correct: true, selected: false },
                d: { answer: 'Nucleus', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What type of symbiosis benefits one organism but harms the other?',
            answers: {
                a: { answer: 'Mutualism', correct: false, selected: false },
                b: { answer: 'Commensalism', correct: false, selected: false },
                c: { answer: 'Parasitism', correct: true, selected: false },
                d: { answer: 'Amensalism', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'Which blood type is known as the universal donor?',
            answers: {
                a: { answer: 'AB+', correct: false, selected: false },
                b: { answer: 'O-', correct: true, selected: false },
                c: { answer: 'A+', correct: false, selected: false },
                d: { answer: 'B-', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What organelle is responsible for protein synthesis?',
            answers: {
                a: { answer: 'Ribosome', correct: true, selected: false },
                b: { answer: 'Lysosome', correct: false, selected: false },
                c: { answer: 'Vacuole', correct: false, selected: false },
                d: { answer: 'Chloroplast', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What is the building block of proteins?',
            answers: {
                a: { answer: 'Monosaccharides', correct: false, selected: false },
                b: { answer: 'Amino Acids', correct: true, selected: false },
                c: { answer: 'Fatty Acids', correct: false, selected: false },
                d: { answer: 'Nucleotides', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What is the main pigment used in photosynthesis?',
            answers: {
                a: { answer: 'Hemoglobin', correct: false, selected: false },
                b: { answer: 'Chlorophyll', correct: true, selected: false },
                c: { answer: 'Carotene', correct: false, selected: false },
                d: { answer: 'Myoglobin', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What is the genetic material in most organisms?',
            answers: {
                a: { answer: 'RNA', correct: false, selected: false },
                b: { answer: 'DNA', correct: true, selected: false },
                c: { answer: 'Proteins', correct: false, selected: false },
                d: { answer: 'Lipids', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: "What process divides a cell's nucleus?",
            answers: {
                a: { answer: 'Cytokinesis', correct: false, selected: false },
                b: { answer: 'Mitosis', correct: true, selected: false },
                c: { answer: 'Meiosis', correct: false, selected: false },
                d: { answer: 'Diffusion', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'Which blood vessels carry blood away from the heart?',
            answers: {
                a: { answer: 'Arteries', correct: true, selected: false },
                b: { answer: 'Veins', correct: false, selected: false },
                c: { answer: 'Capillaries', correct: false, selected: false },
                d: { answer: 'Valves', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What part of the brain controls balance?',
            answers: {
                a: { answer: 'Cerebrum', correct: false, selected: false },
                b: { answer: 'Cerebellum', correct: true, selected: false },
                c: { answer: 'Medulla', correct: false, selected: false },
                d: { answer: 'Hypothalamus', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What molecule carries oxygen in red blood cells?',
            answers: {
                a: { answer: 'Myoglobin', correct: false, selected: false },
                b: { answer: 'Hemoglobin', correct: true, selected: false },
                c: { answer: 'Keratin', correct: false, selected: false },
                d: { answer: 'Collagen', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'What type of macromolecule are enzymes?',
            answers: {
                a: { answer: 'Proteins', correct: true, selected: false },
                b: { answer: 'Carbohydrates', correct: false, selected: false },
                c: { answer: 'Lipids', correct: false, selected: false },
                d: { answer: 'Nucleic Acids', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
        {
            question: 'Which of the following organisms is prokaryotic?',
            answers: {
                a: { answer: 'Fungi', correct: false, selected: false },
                b: { answer: 'Bacteria', correct: true, selected: false },
                c: { answer: 'Plants', correct: false, selected: false },
                d: { answer: 'Animals', correct: false, selected: false },
            },
            status: 'not-answered-yet',
        },
    ]);
    const threshold = 4;

    const getNewQuestion = (questions?: TriviaQuestion[]): TriviaQuestion => {
        const newQuestions = questions || questionPool;
        const unansweredQuestions: TriviaQuestion[] = newQuestions.filter((question) => question.status === 'not-answered-yet');
        const selectedIndex = Math.floor(Math.random() * unansweredQuestions.length);

        return unansweredQuestions[selectedIndex];
    };

    useEffect(() => {
        if (triviaGame.stage === 'game-active') {
            if (triviaGame.quizStatus[4] !== 'not-answered-yet') {
                const gameWon = triviaGame.quizStatus.filter((status) => status === 'correct').length >= threshold;

                setTriviaGame((prev) => {
                    return {
                        ...prev,
                        gameWon: gameWon,
                        stage: 'game-ended',
                    };
                });
            }

            let intervalNum = 0;
            const interval = setInterval(() => {
                setTriviaGame((prev) => {
                    if (prev.millisecondsLeft <= 0) {
                        clearInterval(interval);
                        if (intervalNum % 2 === 0 && correctAnswer === 'unanswered' && triviaGame.stage === 'game-active') {
                            intervalNum++;
                            answerClicked(null);
                        }

                        return { ...prev, millisecondsLeft: 0 };
                    }
                    return { ...prev, millisecondsLeft: prev.millisecondsLeft - 10 };
                });
            }, 10);

            return () => clearInterval(interval);
        }

        if (triviaGame.stage === 'game-ended') {
            const gameWon = triviaGame.gameWon;

            setGame((prev: Game) => {
                return {
                    ...prev,
                    game: gameWon
                        ? {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'trivia-challenge'),
                              gamesWon: [...prev.game.gamesWon, { name: 'trivia-challenge', roundNum: prev.game.number }],
                          }
                        : {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'trivia-challenge'),
                              gamesLost: [...prev.game.gamesLost, { name: 'trivia-challenge', roundNum: prev.game.number }],
                          },
                };
            });
        }
    }, [triviaGame]);

    const shuffleArray = (array: string[]): string[] => {
        const retArray = [...array];
        for (let i = retArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [retArray[i], retArray[j]] = [retArray[j], retArray[i]];
        }
        return retArray;
    };

    const [shuffledArray, setShuffledArray] = useState(shuffleArray(['a', 'b', 'c', 'd']));

    const answerClicked = (which: 'a' | 'b' | 'c' | 'd' | null) => {
        const correct = which === null ? 'incorrect' : triviaGame.currentQuestion?.answers[which].correct ? 'correct' : 'incorrect';
        setCorrectAnswer(correct);

        setTimeout(() => {
            setFadeQuestion(true);
            setTimeout(() => {
                setTriviaGame((prev) => {
                    const quizStatus = [...prev.quizStatus];
                    quizStatus[triviaGame.questionNum - 1] = correct;
                    const newQuestionPool: TriviaQuestion[] = questionPool.map((question) =>
                        question.question.toLowerCase() === triviaGame.currentQuestion?.question.toLowerCase() ? { ...question, status: correct } : { ...question }
                    );

                    setQuestionPool(newQuestionPool);
                    setShuffledArray(shuffleArray(['a', 'b', 'c', 'd']));

                    return {
                        ...prev,
                        quizStatus: [...quizStatus],
                        millisecondsLeft: 10000,
                        questionNum: prev.questionNum + 1,
                        currentQuestion: getNewQuestion(newQuestionPool),
                    } as TriviaGame;
                });
                setCorrectAnswer('unanswered');
                setFadeQuestion(false);
            }, 750);
        }, 500);
    };

    return (
        <>
            <div className='w-full h-full flex flex-col gap-1 width-laptop:gap-3'>
                <span className='flex justify-between items-start'>
                    <h3 className={`${audiowide.className} text-3xl width-laptop:text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                    {triviaGame.stage !== 'instructions' && (
                        <div className={`${orbitronSemibold.className} flex gap-2`}>
                            {triviaGame.quizStatus.map((status, index) => (
                                <div
                                    key={status + index}
                                    className={`${
                                        status === 'correct' ? 'bg-green-400' : status === 'incorrect' || status === 'unanswered' ? ' bg-red-400' : 'bg-gray-400'
                                    } w-6 h-6 border-2 border-white shadow-lg rounded-full`}
                                />
                            ))}
                        </div>
                    )}
                </span>
                <AnimatePresence>
                    {triviaGame.stage === 'instructions' && (
                        <div className='w-full h-full flex flex-col gap-6 items-center justify-center'>
                            <span className='flex'>
                                <CircleHelp className='mt-4 mr-8 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <CircleHelp className='mt-7 mr-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <CircleHelp className='-mt-3 mr-6 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <CircleHelp className='mt-7 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <CircleHelp className='mt-3 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                                <CircleHelp className='-mt-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full' strokeWidth={2} />
                            </span>
                            <span className={`${orbitronSemibold.className} w-[70%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span>In this minigame, you will have to answer various biology questions in a time restraint.</span>
                                <span>
                                    There will be 5 questions. You will have <span className={orbitronBold.className}>10 seconds</span> for each question, and you must get at least{' '}
                                    {threshold} of the questions correct.
                                </span>
                                <span>If you fail to get {threshold} questions correct, the CPU will take your attack!</span>
                            </span>
                            <button
                                onClick={() => {
                                    setTriviaGame((prevGame) => {
                                        return {
                                            ...prevGame,
                                            stage: 'game-active',
                                            currentQuestion: getNewQuestion(),
                                        };
                                    });
                                }}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                BEGIN!
                            </button>
                        </div>
                    )}
                    {triviaGame.stage === 'game-active' && triviaGame.currentQuestion !== null && (
                        <div className='w-full h-full flex items-center justify-center'>
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: fadeQuestion ? 0 : 1 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className='h-full w-[95%] width-laptop:w-3/4 flex flex-col justify-center items-center gap-5 width-laptop:gap-8'
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
                                    <span>{triviaGame.questionNum}</span>
                                    <div
                                        className='absolute -top-[6px] -left-[6px] w-28 h-28 width-laptop:w-32 width-laptop:h-32 rounded-full z-10'
                                        style={{
                                            background: `conic-gradient(transparent ${100 - (triviaGame.millisecondsLeft / 10000) * 100}%, #fff ${
                                                100 - (triviaGame.millisecondsLeft / 10000) * 100
                                            }%)`,
                                            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
                                            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
                                        }}
                                    ></div>
                                </div>
                                <h4 className={`${orbitronBold.className} text-[27px] leading-[34px] width-laptop:text-3xl text-center`}>{triviaGame.currentQuestion.question}</h4>
                                <div className='grid grid-cols-2 grid-rows-2 w-full gap-3'>
                                    {shuffledArray.map((which, index) => (
                                        <div
                                            key={which}
                                            onClick={() => {
                                                if (correctAnswer === 'unanswered') answerClicked(which as 'a' | 'b' | 'c' | 'd');
                                            }}
                                            className='rounded-2xl border-2 border-white shadow-lg flex items-center gap-2 bg-[#6fa9ff] hover:brightness-[1.1] transition-all p-2.5 width-laptop:p-4 cursor-pointer'
                                        >
                                            <div
                                                className={`${orbitronSemibold.className} ${
                                                    index === 0 || index === 2 ? 'brightness-[1.55]' : 'brightness-150'
                                                } p-1 width-laptop:p-4 rounded-full bg-[#4f78b6] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] w-12 h-12 width-laptop:w-16 width-laptop:h-16 grid place-items-center text-xl uppercase`}
                                            >
                                                {index === 0 ? 'A' : index === 1 ? 'B' : index === 2 ? 'C' : index === 3 && 'D'}
                                            </div>
                                            <span className={`${orbitronSemibold.className} text-base width-laptop:text-lg`}>{triviaGame.currentQuestion?.answers[which as 'a' | 'b' | 'c' | 'd'].answer}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {triviaGame.stage === 'game-ended' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full flex flex-col items-center justify-center gap-4 select-none'
                        >
                            {triviaGame.gameWon ? <Crown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} /> : <Frown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} />}
                            <span className={`${orbitronSemibold.className} w-[65%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span className='text-lg width-laptop:text-xl'>You {triviaGame.gameWon ? 'won' : 'lost'}!</span>
                                <span>You got {triviaGame.quizStatus.filter((status) => status === 'correct').length} out of 5 questions correct!</span>
                                <span>
                                    {triviaGame.gameWon
                                        ? `This was above the threshold to win! Click the "ATTACK" button below to launch an attack on the CPU!`
                                        : `This was below the threshold to win. Click the "CONCEDE" button below to accept the attack of the CPU on you.`}
                                </span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                {triviaGame.gameWon ? 'ATTACK!' : 'CONCEDE'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default TriviaChallenge;
