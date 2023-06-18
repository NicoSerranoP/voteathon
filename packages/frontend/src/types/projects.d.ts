export type Member = {
    participantId: number
}

export type Project = {
    id: number
    name: string
    description: string
    challenge: string
    deliverables: string
    repoUrl: string
    members: Member[]
}
