using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace Draxlmaier.GRC.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessUnits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentChunks");

            migrationBuilder.AddColumn<Guid>(
                name: "BusinessUnitId",
                table: "Risks",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BusinessUnitId",
                table: "Policies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BusinessUnitId",
                table: "Controls",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BusinessUnits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BusinessUnits_BusinessUnits_ParentId",
                        column: x => x.ParentId,
                        principalTable: "BusinessUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BusinessUnits_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Risks_BusinessUnitId",
                table: "Risks",
                column: "BusinessUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Policies_BusinessUnitId",
                table: "Policies",
                column: "BusinessUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Controls_BusinessUnitId",
                table: "Controls",
                column: "BusinessUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessUnits_OrganizationId",
                table: "BusinessUnits",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessUnits_ParentId",
                table: "BusinessUnits",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Controls_BusinessUnits_BusinessUnitId",
                table: "Controls",
                column: "BusinessUnitId",
                principalTable: "BusinessUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Policies_BusinessUnits_BusinessUnitId",
                table: "Policies",
                column: "BusinessUnitId",
                principalTable: "BusinessUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Risks_BusinessUnits_BusinessUnitId",
                table: "Risks",
                column: "BusinessUnitId",
                principalTable: "BusinessUnits",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Controls_BusinessUnits_BusinessUnitId",
                table: "Controls");

            migrationBuilder.DropForeignKey(
                name: "FK_Policies_BusinessUnits_BusinessUnitId",
                table: "Policies");

            migrationBuilder.DropForeignKey(
                name: "FK_Risks_BusinessUnits_BusinessUnitId",
                table: "Risks");

            migrationBuilder.DropTable(
                name: "BusinessUnits");

            migrationBuilder.DropIndex(
                name: "IX_Risks_BusinessUnitId",
                table: "Risks");

            migrationBuilder.DropIndex(
                name: "IX_Policies_BusinessUnitId",
                table: "Policies");

            migrationBuilder.DropIndex(
                name: "IX_Controls_BusinessUnitId",
                table: "Controls");

            migrationBuilder.DropColumn(
                name: "BusinessUnitId",
                table: "Risks");

            migrationBuilder.DropColumn(
                name: "BusinessUnitId",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "BusinessUnitId",
                table: "Controls");

            migrationBuilder.CreateTable(
                name: "DocumentChunks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Embedding = table.Column<Vector>(type: "vector(1536)", nullable: true),
                    PageNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentChunks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentChunks_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentChunks_DocumentId",
                table: "DocumentChunks",
                column: "DocumentId");
        }
    }
}
