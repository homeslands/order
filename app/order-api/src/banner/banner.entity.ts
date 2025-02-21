import { AutoMap } from "@automapper/classes";
import { Base } from "src/app/base.entity";
import { Column, Entity } from "typeorm";

@Entity("banner_tbl")
export class Banner extends Base {
  @AutoMap()
  @Column({ name: "title_column"})
  title: string;

  @AutoMap()
  @Column({ name: "content_column"})
  content: string;

  @AutoMap()
  @Column({ name: "image_column", nullable: true })
  image?: string;
  
  @AutoMap()
  @Column({ name: "is_active_column", default: false })
  isActive: boolean;
}
