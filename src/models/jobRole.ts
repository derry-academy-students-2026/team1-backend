

export class JobRole {
    constructor(
        public readonly id: number,
        public readonly jobRoleName: string,
        public readonly location: string,
        public readonly capabilityId: number,
        public readonly bandId: number,
        public readonly closingDate: string,
        public readonly status: string,
    ) {
        if (!jobRoleName.trim()) throw new Error("Job role name cannot be empty");
        if (!location.trim()) throw new Error("Location cannot be empty");
        if (!closingDate.trim()) throw new Error("Closing date cannot be empty");
        if (!status.trim()) throw new Error("Status cannot be empty");
    }
}
