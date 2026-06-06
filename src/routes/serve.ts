import Elysia, { t } from "elysia";
import { minio } from "../lib/minio";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { env } from "../env";

export const serveRoute = new Elysia({ prefix: "/assets"})
                            .get(
                                "/", async ({query}) => {
                                    const {search = "", page = 1, limit = 20} = query;
                                    const allItems: { key: string; size: number; lastModified: Date }[] = [];
                                    let continuationToken: string | undefined;

                                    do {
                                        const response = await minio.send(
                                            new ListObjectsV2Command({
                                                Bucket: env.BUCKET_NAME,
                                                // Prefix: "public/",
                                                ContinuationToken: continuationToken
                                            })
                                        );

                                        for (const obj of response.Contents ?? []){
                                            if (obj.Key) {
                                                allItems.push({
                                                    key: obj.Key,
                                                    size: obj.Size ?? 0,
                                                    lastModified: obj.LastModified ?? new Date(),
                                                })
                                            }
                                        };

                                        continuationToken = response.NextContinuationToken;
                                    } while (continuationToken) {
                                        const filtered = search ? allItems.filter((item) => {
                                            item.key.toLowerCase().includes(search.toLowerCase())
                                        }) : allItems;

                                        const total = filtered.length;
                                        const totalPages = Math.ceil(total / limit);
                                        const offset = (page - 1) * limit;
                                        const items = filtered.slice(offset, offset + limit).map((item) => ({
                                            key: item.key,
                                            filename: item.key.replace("public/", ""),
                                            size: item.size,
                                            lastModified: item.lastModified,
                                            downloadUrl: `/assets/download/${encodeURIComponent(item.key)}`,
                                        }));

                                        return {
                                            data: items,
                                            pagination: {
                                            page,
                                            limit,
                                            total,
                                            totalPages,
                                            hasNext: page < totalPages,
                                            hasPrev: page > 1,
                                            },
                                        };
                                    }
                                }, {
                                    query: t.Object({
                                        search: t.Optional(t.String()),
                                        page: t.Optional(t.Numeric()),
                                        limit: t.Optional(t.Numeric()),
                                    }),
                                }
                            )
                            .get("download/:key", async ({params, set}) => {
                                const key = decodeURIComponent(params.key);

                                    try {
                                        const response = await minio.send(
                                        new GetObjectCommand({
                                            Bucket: env.BUCKET_NAME,
                                            Key: key,
                                        })
                                        );

                                        const filename = key.split("/").pop() ?? "file";

                                        set.headers["Content-Type"] =
                                        response.ContentType ?? "application/octet-stream";
                                        set.headers["Content-Disposition"] =
                                        `attachment; filename="${filename}"`;

                                        // Stream the file directly
                                        return response.Body?.transformToWebStream();
                                    } catch (err) {
                                        set.status = 404;
                                        return { message: "File not found" };
                                    }
                                    },
                                    {
                                    params: t.Object({
                                        key: t.String(),
                                    }),
                                    }
                                )