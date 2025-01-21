import { Game, useGameContext } from '@/app/singleplayer/context';
import { AnimatePresence, motion } from 'framer-motion';
import { Audiowide, Nunito, Orbitron } from 'next/font/google';
import { CircleHelp, Clock, Crown, Divide, Equal, Frown, Minus, Plus, Radical, Target, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type GameStage = 'instructions' | 'game-active' | 'game-ended';
type QuestionStatus = 'correct' | 'incorrect' | 'unanswered' | 'not-answered-yet';

type MathQuestion = {
    question: string;
    answer: number;
    status: QuestionStatus;
};

type MathGame = {
    stage: GameStage;
    questionNum: number;
    quizStatus: QuestionStatus[];
    currentQuestion: MathQuestion | null;
    gameWon: boolean;
    millisecondsLeft: number;
};

const nunitoBold = Nunito({ weight: '900', subsets: ['latin'] });
const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });
const orbitronBold = Orbitron({ weight: '800', subsets: ['latin'] });
const orbitronSemibold = Orbitron({ weight: '500', subsets: ['latin'] });
const orbitronLight = Orbitron({ weight: '400', subsets: ['latin'] });

const MathChallenge = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const context = useGameContext();
    if (context === undefined) throw new Error('useContext(GameContext) must be used within a GameContext.Provider');

    const { game, setGame } = context;
    const [fadeQuestion, setFadeQuestion] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<'correct' | 'incorrect' | 'unanswered'>('unanswered');
    const [response, setResponse] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);
    const timePerQuestion = 5000;
    const numQuestions = 8;
    const threshold = 7;
    const [mathGame, setMathGame] = useState<MathGame>({
        stage: 'instructions',
        questionNum: 1,
        millisecondsLeft: timePerQuestion,
        currentQuestion: null,
        gameWon: false,
        quizStatus: new Array(numQuestions).fill('not-answered-yet'),
    });

    const generateMathQuestion = (questionNumber: number): { question: string; answer: number } => {
        const getRandomInt = (min: number, max: number): number => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        let question = '';
        let answer = 0;

        if (questionNumber >= 1 && questionNumber <= 3) {
            // Addition or subtraction with numbers no higher than 50
            const num1 = getRandomInt(1, 50);
            const num2 = getRandomInt(1, 50);
            const operator = Math.random() < 0.5 ? '+' : '-';

            question = `${num1} ${operator} ${num2}`;
            answer = operator === '+' ? num1 + num2 : num1 - num2;
        } else if (questionNumber >= 4 && questionNumber <= 5) {
            // Multiplication/division or addition/subtraction with numbers higher than 50
            if (Math.random() < 0.5) {
                // Multiplication or division with numbers no higher than 12
                const num1 = getRandomInt(1, 12);
                const num2 = getRandomInt(1, 12);
                const operator = Math.random() < 0.5 ? '*' : '/';

                question = operator === '*' ? `${num1} * ${num2}` : `${num1 * num2} / ${num2}`;
                answer = operator === '*' ? num1 * num2 : num1;
            } else {
                // Addition or subtraction with numbers higher than 50
                const num1 = getRandomInt(51, 100);
                const num2 = getRandomInt(51, 100);
                const operator = Math.random() < 0.5 ? '+' : '-';

                question = `${num1} ${operator} ${num2}`;
                answer = operator === '+' ? num1 + num2 : num1 - num2;
            }
        } else if (questionNumber >= 6 && questionNumber <= 8) {
            // Two expressions with an operator in between
            const num1 = getRandomInt(1, 12);
            const num2 = getRandomInt(1, 12);
            const num3 = getRandomInt(1, 12);
            const num4 = getRandomInt(1, 12);

            const operator1 = Math.random() < 0.5 ? '*' : '/';
            const operator2 = Math.random() < 0.5 ? '+' : '-';

            const expr1 = operator1 === '*' ? `${num1} * ${num2}` : `${num1 * num2} / ${num2}`;
            const expr2 = operator2 === '+' ? `${num3} + ${num4}` : `${num3 + num4} - ${num4}`;

            question = `(${expr1}) ${operator2} (${expr2})`;
            const value1 = operator1 === '*' ? num1 * num2 : num1;
            const value2 = operator2 === '+' ? num3 + num4 : num3;
            answer = operator2 === '+' ? value1 + value2 : value1 - value2;
        }

        return { question, answer };
    };

    useEffect(() => {
        if (mathGame.stage === 'game-active') {
            if (mathGame.quizStatus[numQuestions - 1] !== 'not-answered-yet') {
                const gameWon = mathGame.quizStatus.filter((status) => status === 'correct').length >= threshold;

                setMathGame((prev) => {
                    return {
                        ...prev,
                        gameWon: gameWon,
                        stage: 'game-ended',
                    };
                });
            }

            let intervalNum = 0;
            const interval = setInterval(() => {
                setMathGame((prev) => {
                    if (prev.millisecondsLeft <= 0) {
                        clearInterval(interval);
                        if (intervalNum % 2 === 0 && correctAnswer === 'unanswered' && mathGame.stage === 'game-active') {
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

        if (mathGame.stage === 'game-ended') {
            const gameWon = mathGame.quizStatus.filter((status) => status === 'correct').length >= threshold;

            setGame((prev: Game) => {
                return {
                    ...prev,
                    game: gameWon
                        ? {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'math-challenge'),
                              gamesWon: [...prev.game.gamesWon, { name: 'math-challenge', roundNum: prev.game.number }],
                          }
                        : {
                              ...prev.game,
                              stage: 'not-started',
                              gamesLeft: prev.game.gamesLeft.filter((game) => game !== 'math-challenge'),
                              gamesLost: [...prev.game.gamesLost, { name: 'math-challenge', roundNum: prev.game.number }],
                          },
                };
            });
        }
    }, [mathGame]);

    const handleSubmit = () => {
        if ((response === '' && mathGame.millisecondsLeft > 0) || submitted) return;
        setSubmitted(true);
        const correct = Number(response) === mathGame.currentQuestion?.answer ? 'correct' : 'incorrect';
        setCorrectAnswer(correct);

        setTimeout(() => {
            setFadeQuestion(true);
            setTimeout(() => {
                setMathGame((prev) => {
                    const quizStatus = [...prev.quizStatus];
                    quizStatus[mathGame.questionNum - 1] = correct;

                    const { question, answer } = generateMathQuestion(prev.questionNum + 1);

                    return {
                        ...prev,
                        quizStatus: [...quizStatus],
                        millisecondsLeft: timePerQuestion,
                        questionNum: prev.questionNum + 1,
                        currentQuestion: {
                            question,
                            answer,
                            status: 'not-answered-yet',
                        },
                    } as MathGame;
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
                <span className='flex justify-between items-start'>
                    <h3 className={`${audiowide.className} text-3xl width-laptop:text-4xl font-bold text-left mb-5 uppercase`}>{game.game.selectedGame?.replaceAll('-', ' ')}</h3>
                    {mathGame.stage !== 'instructions' && (
                        <div className={`${orbitronSemibold.className} flex gap-2`}>
                            {mathGame.quizStatus.map((status, index) => (
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
                    {mathGame.stage === 'instructions' && (
                        <div className='w-full h-full flex flex-col gap-6 items-center justify-center'>
                            <span className='flex'>
                                <Plus className='mt-4 mr-8 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-4' strokeWidth={3} />
                                <Minus className='mt-7 mr-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-4' strokeWidth={3} />
                                <X className='-mt-3 mr-6 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-4' strokeWidth={3} />
                                <Divide className='mt-7 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-4' strokeWidth={3} />
                                <Radical className='mt-3 mr-4 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-4' strokeWidth={3} />
                                <Equal className='-mt-2 text-white w-20 h-20 width-laptop:w-24 width-laptop:h-24 bg-[rgba(255,255,255,.4)] rounded-full p-4' strokeWidth={3} />
                            </span>
                            <span className={`${orbitronSemibold.className} w-[70%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span>In this minigame, you will have to solve basic math equations in a time restraint.</span>
                                <span>
                                    There will be {numQuestions} questions. You will have <span className={orbitronBold.className}>5 seconds</span> for each question, and you must get
                                    at least {threshold} of the questions correct.
                                </span>
                                <span>If you fail to get {threshold} questions correct, the CPU will take your attack!</span>
                            </span>
                            <button
                                onClick={() => {
                                    setMathGame((prev) => {
                                        const { question, answer } = generateMathQuestion(1);

                                        return {
                                            ...prev,
                                            stage: 'game-active',
                                            currentQuestion: {
                                                question,
                                                answer,
                                                status: 'not-answered-yet',
                                            },
                                        } as MathGame;
                                    });
                                }}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                BEGIN!
                            </button>
                        </div>
                    )}
                    {mathGame.stage === 'game-active' && mathGame.currentQuestion !== null && (
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
                                    } text-white w-28 h-28 text-6xl width-laptop:w-32 width-laptop:h-32 width-laptop:text-7xl border-[6px] shadow-2xl border-transparent rounded-full grid place-items-center  relative transition-all`}
                                >
                                    <span>{mathGame.questionNum}</span>
                                    <div
                                        className='absolute -top-[6px] -left-[6px] w-28 h-28 width-laptop:w-32 width-laptop:h-32 rounded-full z-10'
                                        style={{
                                            background: `conic-gradient(transparent ${100 - (mathGame.millisecondsLeft / timePerQuestion) * 100}%, #fff ${
                                                100 - (mathGame.millisecondsLeft / timePerQuestion) * 100
                                            }%)`,
                                            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
                                            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
                                        }}
                                    ></div>
                                </div>
                                <h4 className={`${orbitronBold.className} text-2xl width-laptop:text-3xl text-center`}>{mathGame.currentQuestion.question}</h4>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!submitted) {
                                            handleSubmit();
                                        }
                                    }}
                                    className='grid place-items-center w-full gap-3'
                                >
                                    <input
                                        type='text'
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            if (correctAnswer !== 'unanswered') return;
                                            const input = e.target.value;
                                            const isValidInput = /^-?\d*$/.test(input);

                                            if (isValidInput) setResponse(() => input);
                                        }}
                                        value={response === '' ? '' : response === '-' ? '-' : Number(response)}
                                        autoFocus
                                        className={`${orbitronBold.className} outline-none text-lg width-laptop:text-xl py-2.5 width-laptop:py-4 w-1/2 bg-white bg-opacity-80 rounded-full shadow-lg border-4 border-[#5b8ad0]  text-center text-[#5b8ad0]`}
                                    />
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
                    {mathGame.stage === 'game-ended' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full flex flex-col items-center justify-center gap-4 select-none'
                        >
                            {mathGame.gameWon ? <Crown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} /> : <Frown className='w-36 h-36 width-laptop:w-72 width-laptop:h-72 text-white' strokeWidth={3} />}
                            <span className={`${orbitronSemibold.className} w-[65%] text-center text-base width-laptop:text-lg flex flex-col gap-1.5`}>
                                <span className='text-lg width-laptop:text-xl'>You {mathGame.gameWon ? 'won' : 'lost'}!</span>
                                <span>
                                    You got {mathGame.quizStatus.filter((status) => status === 'correct').length} out of {numQuestions} questions correct!
                                </span>
                                <span>
                                    {mathGame.gameWon
                                        ? `This was above the threshold to win! Click the "ATTACK" button below to launch an attack on the CPU!`
                                        : `This was below the threshold to win. Click the "CONCEDE" button below to accept the attack of the CPU on you.`}
                                </span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`${orbitronBold.className} px-10 py-4 text-xl width-laptop:px-12 width-laptop:text-2xl rounded-lg border-4 border-[#5b8ad0] shadow-[0px_10px_0px_5px_#5b8ad0] hover:shadow-none hover:translate-y-[10px] transition-all duration-125`}
                            >
                                {mathGame.gameWon ? 'ATTACK!' : 'CONCEDE'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default MathChallenge;
