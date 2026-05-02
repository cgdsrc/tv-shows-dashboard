export interface Show {
    id: number
    name: string
    genres: string[]
    image: {
        medium: string
        original: string
    } | null
    summary: string | null
    rating: {
        average: number | null
    }
    premiered: string | null
    ended: string | null
    language: string | null
    status: string | null
    officialSite: string | null
    network: {
        name: string
        country: {
            name: string
        }
    } | null
    schedule: {
        time: string
        days: string[]
    }
    runtime: number | null
}

export interface CastMember {
    person: {
        id: number
        name: string
        image: {
            medium: string
            original: string
        } | null
    }
    character: {
        id: number
        name: string
        image: {
            medium: string
            original: string
        } | null
    }
}

export interface Season {
    id: number
    number: number
    name: string
    episodeOrder: number | null
    premiereDate: string | null
    endDate: string | null
    image: {
        medium: string
        original: string
    } | null
}

export interface Episode {
    id: number
    name: string
    season: number
    number: number | null
    airdate: string | null
    runtime: number | null
    image: {
        medium: string
        original: string
    } | null
    summary: string | null
}

export interface ShowDetail extends Show {
    _embedded?: {
        cast?: CastMember[]
        seasons?: Season[]
    }
}

export interface SearchResult {
    score: number
    show: Show
}

export interface GenreGroup {
    genre: string
    shows: Show[]
}
