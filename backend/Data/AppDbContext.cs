using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Item> Items => Set<Item>();

    // The schema is owned by database/create_tables.sql; EF only maps onto it.
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Location>(e =>
        {
            e.ToTable("locations");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
        });
        b.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.NameKey).HasColumnName("name_key");
            e.HasIndex(x => x.NameKey).IsUnique();
        });
        b.Entity<Item>(e =>
        {
            e.ToTable("items");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.LocationId).HasColumnName("location_id");
            e.Property(x => x.CategoryId).HasColumnName("category_id");
            e.Property(x => x.PurchaseDate).HasColumnName("purchase_date").HasColumnType("date");
            e.Property(x => x.BestBefore).HasColumnName("best_before").HasColumnType("date");
            e.HasOne(x => x.Location).WithMany().HasForeignKey(x => x.LocationId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
