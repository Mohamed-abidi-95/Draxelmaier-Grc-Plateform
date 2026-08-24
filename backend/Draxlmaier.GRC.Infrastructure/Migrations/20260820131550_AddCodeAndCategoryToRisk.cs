using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Draxlmaier.GRC.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCodeAndCategoryToRisk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Risks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Risks",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Risks");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Risks");
        }
    }
}
