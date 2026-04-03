import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Severity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
}

export enum Status {
    OPEN = "open",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
}

@Entity("incidents")
@Index(["createdAt"])
export class Incident {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text" })
    title: string;

    @Column({ type: "text" })
    description: string;

    @Index()
    @Column({ type: "text" })
    service: string;

    @Index()
    @Column({ type: "enum", enum: Severity })
    severity: Severity;

    @Index()
    @Column({ type: "enum", enum: Status, default: Status.OPEN })
    status: Status;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt: Date | null;
}
