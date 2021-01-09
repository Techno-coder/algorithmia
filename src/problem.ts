export class Problem {
    name: string;
    auxiliary: Auxiliary;
    statement: Element;
    input?: Element;
    output?: Element;
    hints?: Element;
    explanation?: Element;
    samples: SampleCase[];
    constraints?: Element;
    subtasks?: Element;
}

export class SampleCase {
    input: string;
    output: string;
}

export class Auxiliary {
    inputMethod: string;
    outputMethod: string;
    memoryLimit: string;
    timeLimit: string;
}

export class SubmissionStub {
    link: string;
    date: string;
    score?: number;
}
