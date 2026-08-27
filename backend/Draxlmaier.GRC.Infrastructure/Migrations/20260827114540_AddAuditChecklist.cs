using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Draxlmaier.GRC.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditChecklist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AuditId = table.Column<Guid>(type: "uuid", nullable: false),
                    Requirement = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: false),
                    EvidenceId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditItems_Audits_AuditId",
                        column: x => x.AuditId,
                        principalTable: "Audits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AuditItems_Documents_EvidenceId",
                        column: x => x.EvidenceId,
                        principalTable: "Documents",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditItems_AuditId",
                table: "AuditItems",
                column: "AuditId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditItems_EvidenceId",
                table: "AuditItems",
                column: "EvidenceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditItems");
        }
    }
}
