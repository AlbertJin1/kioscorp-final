from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_owner(sender, instance, created, **kwargs):
    if created and instance.username == "owner":
        instance.role = "owner"
        instance.save()


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("cashier", "Cashier"),  # Change from "employee" to "cashier"
    )

    # Additional fields
    gender = models.CharField(
        max_length=10, choices=[("Male", "Male"), ("Female", "Female")], blank=False
    )
    phone_number = models.CharField(max_length=15, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default="cashier"
    )  # Change default to "cashier"
    profile_picture = models.ImageField(
        upload_to="user_profile/", blank=True, null=True
    )

    def __str__(self):
        return self.username


class Log(models.Model):
    username = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)


class MainCategory(models.Model):
    main_category_id = models.AutoField(primary_key=True)
    main_category_name = models.CharField(max_length=255)

    def __str__(self):
        return self.main_category_name


class NextSubCategoryId(models.Model):
    next_id = models.IntegerField(default=1)


class NextProductId(models.Model):
    next_id = models.IntegerField(default=1)


class SubCategory(models.Model):
    sub_category_id = models.AutoField(primary_key=True)
    sub_category_name = models.CharField(max_length=255)
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    sub_category_image = models.ImageField(
        upload_to="subcategories/", null=True, blank=True
    )

    def save(self, *args, **kwargs):
        if not self.sub_category_id:
            next_id = NextSubCategoryId.objects.first()
            if next_id:
                year = timezone.now().year
                month = timezone.now().month
                self.sub_category_id = f"{year}{month:02}{next_id.next_id:04}"
                next_id.next_id += 1
                next_id.save()
            else:
                year = timezone.now().year
                month = timezone.now().month
                self.sub_category_id = f"{year}{month:02}0001"
                NextSubCategoryId.objects.create(next_id=2)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.sub_category_name


class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_image = models.ImageField(upload_to="products/")
    product_name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=255)
    product_size = models.CharField(max_length=255)
    product_brand = models.CharField(max_length=255)
    product_color = models.CharField(max_length=255)
    product_quantity = models.IntegerField(default=0)
    product_description = models.TextField(blank=True, null=True)  # Add this line
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_added = models.DateTimeField(auto_now_add=True)
    product_sold = models.IntegerField(default=0)

    sub_category = models.ForeignKey(SubCategory, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.product_id:
            next_id = NextProductId.objects.first()
            if next_id:
                year = timezone.now().year
                month = timezone.now().month
                self.product_id = f"{year}{month:02}{next_id.next_id:07}"
                next_id.next_id += 1
                next_id.save()
            else:
                year = timezone.now().year
                month = timezone.now().month
                self.product_id = f"{year}{month:02}0000001"
                NextProductId.objects.create(next_id=2)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.product_name


class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    date_created = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.customer_id:
            next_id = NextCustomerId.objects.first()
            if next_id:
                year = timezone.now().year
                month = timezone.now().month
                self.customer_id = f"{year}{month:02}{next_id.next_id:04}"
                next_id.next_id += 1
                next_id.save()
            else:
                year = timezone.now().year
                month = timezone.now().month
                self.customer_id = f"{year}{month:02}0001"
                NextCustomerId.objects.create(next_id=2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Customer {self.customer_id}"


class NextCustomerId(models.Model):
    next_id = models.IntegerField(default=1)


class Order(models.Model):
    ORDER_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Void", "Void"),
    )

    order_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_date_created = models.DateTimeField(default=timezone.now)
    order_status = models.CharField(
        max_length=10, choices=ORDER_STATUS_CHOICES, default="Pending"
    )
    order_paid_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00
    )
    order_change = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    order_cashier = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.order_id:
            next_id = NextOrderId.objects.first()
            if next_id:
                year = timezone.now().year
                month = timezone.now().month
                self.order_id = f"{year}{month:02}{next_id.next_id:04}"
                next_id.next_id += 1
                next_id.save()
            else:
                year = timezone.now().year
                month = timezone.now().month
                self.order_id = f"{year}{month:02}0001"
                NextOrderId.objects.create(next_id=2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id}"


class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    order_id = models.ForeignKey(
        "Order", on_delete=models.CASCADE, db_column="order_id"
    )
    feedback_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)]
    )  # Rating from 1 to 5
    feedback_satisfaction = models.CharField(
        max_length=50,
        choices=[
            ("Not Satisfied", "Not Satisfied"),
            ("Slightly Satisfied", "Slightly Satisfied"),
            ("Neutral", "Neutral"),
            ("Satisfied", "Satisfied"),
            ("Very Satisfied", "Very Satisfied"),
        ],
    )
    feedback_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback {self.feedback_id} by Customer {self.customer_id}"


class NextOrderId(models.Model):
    next_id = models.IntegerField(default=1)


class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    order_item_quantity = models.IntegerField()
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.order_item_id:
            next_id = NextOrderItemId.objects.first()
            if next_id:
                year = timezone.now().year
                month = timezone.now().month
                self.order_item_id = f"{year}{month:02}{next_id.next_id:04}"
                next_id.next_id += 1
                next_id.save()
            else:
                year = timezone.now().year
                month = timezone.now().month
                self.order_item_id = f"{year}{month:02}0001"
                NextOrderItemId.objects.create(next_id=2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order Item {self.order_item_id}"


class NextOrderItemId(models.Model):
    next_id = models.IntegerField(default=1)

class VATSetting(models.Model):
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=12.00)  # Default is 12% as per Philippine VAT
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"VAT: {self.vat_percentage}%"