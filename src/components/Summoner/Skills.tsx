import { Summoner } from '../../state/user/actions'
import { CLASSES } from '../../constants/classes'
import useRarity from '../../hooks/useRarity'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { useCallback, useEffect, useState } from 'react'
import { fromWei } from 'web3-utils'
import Transfer from './Transfer'
import { ATTRIBUTES, Skill, SKILLS } from '../../constants/codex'
import useSkills from '../../hooks/useSkills'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

interface SummonerStatsCardProps {
    summoner: Summoner
}

export default function SummonerSkillsCard({ summoner }: SummonerStatsCardProps): JSX.Element {
    const { exp, levelUp } = useRarity()

    const { library, chainId } = useActiveWeb3React()

    const { get_skills } = useSkills()

    const windowVisible = useIsWindowVisible()

    const [state, setState] = useState<{ actual: string; nextLvl: string }>({ actual: '0', nextLvl: '0' })

    const [currSkills, setCurrSkills] = useState<number[]>([])

    const fetch = useCallback(async () => {
        const experience = await exp(summoner.id, summoner._level)
        const skills = await get_skills(summoner.id)
        setCurrSkills(skills)
        setState({ actual: fromWei(experience.actual.toString()), nextLvl: fromWei(experience.next.toString()) })
    }, [setState, exp, summoner, get_skills])

    useEffect(() => {
        if (!library || !windowVisible || !chainId || !exp) return
        fetch()
    }, [library, chainId, windowVisible, exp, fetch])

    const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)


    return (
        <div className="w-full border-custom-border border-8">
            <div className="grid grid-cols-1 gap-">
                <div className="p-4">
                    <div className="bg-custom-green mb-4 border-8 border-custom-border h-30 w-32 mx-auto">
                        <img
                            className="p-4 h-24 mx-auto"
                            src={CLASSES[summoner._class].image}
                            alt={CLASSES[summoner._class].name}
                        />
                    </div>
                    <div className="text-white bg-custom-blue px-2 text-xl border-2 border-solid w-32 mx-auto">
                        <h1>{CLASSES[summoner._class].name}</h1>
                    </div>
                </div>
                <Transfer summoner={summoner} />
                <div className="px-8 text-left text-white text-md font-bold">
                    <div className="flex justify-between items-center my-2">
                        <span>Summoner:</span>
                        <span>{parseInt(summoner.id, 16)}</span>
                    </div>
                    <div className="flex justify-between items-center my-2">
                        <span>Level:</span>
                        <span>
                            {parseInt(summoner._level, 16)}{' '}
                            <span className="text-xs">
                                ({state.actual}/{state.nextLvl})
                            </span>
                        </span>
                        {parseInt(state.actual) >= parseInt(state.nextLvl) ? (
                            <button
                                className="bg-custom-green border-2 rounded-md text-xs p-1"
                                onClick={async () => {
                                    await levelUp(summoner.id)
                                }}
                            >
                                Level UP
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className="text-center">
                        <span>Hover the mouse over a skill to see a description</span>
                        <div className="h-20 bg-white rounded-md text-custom-background">
                            {hoveredSkill ? (
                                <div className="m-2 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <span className="text-xs">
                                            Key attribute: {ATTRIBUTES[hoveredSkill.attribute_id]}
                                        </span>
                                        <span className="text-xs">
                                            Armor check penalty: {hoveredSkill.armor_check_penalty ? 'true' : 'false'}
                                        </span>
                                        {hoveredSkill.synergy > 0 && (
                                            <span className="text-xs md:col-span-2">
                                                Skill Synergy: {SKILLS[hoveredSkill.synergy].name}
                                            </span>
                                        )}
                                        <div />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-20 mt-2" />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full mx-auto mt-10  gap-5 mb-10">
                        {Object.keys(SKILLS).map((k) => {
                            return (
                                <div key={k} onMouseEnter={() => setHoveredSkill(SKILLS[k])}
                                     className="text-white w-full text-center bg-custom-green py-1 px-2 text-xs border-2 border-solid"
                                >
                                    <div><span>{SKILLS[k].name}</span></div>
                                    <div className="flex flex-row justify-between items-center">
                                        <FontAwesomeIcon icon={faMinus}/>
                                        <span>{currSkills[parseInt(k)]}</span>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </div>
                                </div>
                            )
                        })}
                        <div className="mx-auto w-full">
                            <button>Assign Skills</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
