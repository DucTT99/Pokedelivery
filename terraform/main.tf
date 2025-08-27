#################################################
# Provider
#################################################
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}
 
provider "azurerm" {
  features {}
}
 
#################################################
# Variables
#################################################
variable "resource_group_name" {
  default = "rg-demo"
}
 
variable "location" {
  default = "eastus"
}
 
#################################################
# Resource Group
#################################################
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}
 
#################################################
# Networking
#################################################
resource "azurerm_virtual_network" "vnet" {
  name                = "demo-vnet"
address_space = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
}
 
resource "azurerm_subnet" "subnet" {
  name                 = "demo-subnet"
resource_group_name = azurerm_resource_group.rg.name
virtual_network_name = azurerm_virtual_network.vnet.name
address_prefixes = ["10.0.1.0/24"]
}
 
resource "azurerm_network_security_group" "nsg" {
  name                = "demo-nsg"
  location            = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
 
  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}
 
resource "azurerm_network_interface" "nic1" {
  name                = "nic1"
  location            = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
 
  ip_configuration {
    name                          = "internal"
subnet_id = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}
 
resource "azurerm_network_interface" "nic2" {
  name                = "nic2"
  location            = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
 
  ip_configuration {
    name                          = "internal"
subnet_id = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}
 
#################################################
# Virtual Machines (Ubuntu 22.04 LTS)
#################################################
resource "azurerm_linux_virtual_machine" "vm1" {
  name                = "vm1"
resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B1s"
  admin_username      = "azureuser"
 
network_interface_ids = [azurerm_network_interface.nic1.id]
 
  admin_ssh_key {
    username   = "azureuser"
public_key = file("/home/duc_admin/terraform/id_rsa.pub")
  }
 
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
 
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}
 
resource "azurerm_linux_virtual_machine" "vm2" {
  name                = "vm2"
resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B1s"
  admin_username      = "azureuser"
 
network_interface_ids = [azurerm_network_interface.nic2.id]
 
  admin_ssh_key {
    username   = "azureuser"
    public_key = file("/home/duc_admin/terraform/id_rsa.pub")
  }
 
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
 
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}
 
#################################################
# Function App
#################################################
resource "azurerm_storage_account" "storage" {
  name                     = "funcappstorage${random_string.rand.result}"
resource_group_name = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}
 
resource "random_string" "rand" {
  length  = 6
  upper   = false
  special = false
}
 
resource "azurerm_service_plan" "plan" {
  name                = "func-app-plan"
  location            = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "Y1" # Consumption plan
}

#################################################
# Application Insights
#################################################
resource "azurerm_application_insights" "appinsights" {
  name                = "funcapp-ai-${random_string.rand.result}"
  location            = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}
 
#################################################
# Function App (with Application Insights)
#################################################
resource "azurerm_linux_function_app" "functionapp" {
  name                       = "my-function-app-${random_string.rand.result}"
  location                   = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
service_plan_id = azurerm_service_plan.plan.id
storage_account_name = azurerm_storage_account.storage.name
storage_account_access_key = azurerm_storage_account.storage.primary_access_key
 
  site_config {
    application_stack {
      python_version = "3.10"
    }
  }
 
  app_settings = {
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.appinsights.instrumentation_key
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.appinsights.connection_string
AzureWebJobsStorage = azurerm_storage_account.storage.primary_connection_string
  }
}