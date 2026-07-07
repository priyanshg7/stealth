import torch
import torch.nn as nn
import torchvision.models as models

class DiseaseClassifier(nn.Module):
    def __init__(self, architecture='efficientnet_b0', num_classes=2, pretrained=True, freeze_backbone=True):
        super(DiseaseClassifier, self).__init__()
        
        self.architecture = architecture
        
        if architecture == 'efficientnet_b0':
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            self.backbone = models.efficientnet_b0(weights=weights)
            
            # EfficientNet has a 'classifier' block containing Dropout and Linear
            in_features = self.backbone.classifier[1].in_features
            self.backbone.classifier[1] = nn.Linear(in_features, num_classes)
            
        elif architecture == 'efficientnet_b3':
            weights = models.EfficientNet_B3_Weights.DEFAULT if pretrained else None
            self.backbone = models.efficientnet_b3(weights=weights)
            
            in_features = self.backbone.classifier[1].in_features
            self.backbone.classifier[1] = nn.Linear(in_features, num_classes)
            
        elif architecture == 'mobilenet_v3_large':
            weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
            self.backbone = models.mobilenet_v3_large(weights=weights)
            
            # MobileNetV3 has a 'classifier' block
            in_features = self.backbone.classifier[3].in_features
            self.backbone.classifier[3] = nn.Linear(in_features, num_classes)
            
        else:
            raise ValueError(f"Unsupported architecture: {architecture}")

        if freeze_backbone:
            self._freeze_backbone()

    def _freeze_backbone(self):
        # Freeze all parameters
        for param in self.backbone.parameters():
            param.requires_grad = False
            
        # Unfreeze the classifier block depending on architecture
        if self.architecture in ['efficientnet_b0', 'efficientnet_b3']:
            for param in self.backbone.classifier.parameters():
                param.requires_grad = True
        elif self.architecture == 'mobilenet_v3_large':
            for param in self.backbone.classifier.parameters():
                param.requires_grad = True

    def unfreeze_all(self):
        """Unfreeze all layers for phase 2 fine-tuning"""
        for param in self.parameters():
            param.requires_grad = True

    def forward(self, x):
        return self.backbone(x)
