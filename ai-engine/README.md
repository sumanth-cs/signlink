# Real-Time-Sign-Language-Detection-LSTM

A supervised, deep learning project using a neural network with LSTM layers for sequences.

Steps followed are:
* Extract holistic keypoints
* Train an LSTM DL Model
* Make real time predictions using OpenCV

### Input
This model has been trained using MediaPipe Holistic. MediaPipe Holistic is an open-source framework developed by Google Research that enables real-time, multi-modal understanding of people's actions and movements. It combines several machine learning models to provide holistic analysis of video or image input, extracting information about body pose, face attributes, and hand tracking.

The framework is designed to work with a wide range of input sources, including webcams, pre-recorded videos, and image sequences. It leverages deep learning models to perform various tasks related to human understanding, such as body pose estimation, face detection and tracking, facial landmark detection, hand tracking, and gesture recognition.

In MediaPipe Holistic, landmarks refer to specific points or keypoints that are detected and tracked on different body parts, including the face, body pose, and hands. These landmarks represent important locations or features on the human body and provide valuable information for understanding and analyzing human actions and movements. Following are the landmarks used in this project:
* Face Landmarks
* Pose Landmarks
* Left Hand Landmarks
* Right Hand Landmarks
 This is how the landmarks are marked:

![App Screenshot](https://github.com/AkGu2002/Real-Time-Sign-Language-Detection-LSTM/assets/74046369/fbe3595e-157e-4c7b-8903-ebd7338931b7)

### Dependency/ Library Used
tensorflow

keras

opencv

mediapipe

sklearn

matplotlib

cv2

numpy

os

time 

### Setting up Folders and Collecting Keypoint Values for Train and Test Data
Here in this project, we focus to detect three actions. First one being 'Hello', second as 'Thank You' and the last one being 'I love you'.

* The code initializes the video capture from the default camera and sets up MediaPipe Holistic with specified parameters for detection and tracking confidence. It then enters a series of nested loops to iterate over different actions, video sequences, and frames within each sequence.
* no_sequences is set to 30, meaning there will be 30 videos collected for each action.
* sequence_length is set to 30, indicating that each video will consist of 30 frames.
* Entire dataset is splitted into train and test using train_test_split. The split being 95% and 5% respectively.
* Assigned indexing to the actions using to_categorical.

### Building and Training LSTM Neural Network
* Model Initialization:
The code initializes a sequential model using Sequential(). This allows for the creation of a linear stack of layers.
* Adding LSTM Layers:

The code adds three LSTM layers to the model.
The first LSTM layer has 64 units and returns sequences (i.e., outputs a sequence for each input time step).
The second LSTM layer also has 128 units and returns sequences.
The third LSTM layer has 64 units but does not return sequences (i.e., outputs a single vector for the entire sequence).
* Adding Dense Layers:

The code adds three dense layers after the LSTM layers.
The first dense layer has 64 units and uses the ReLU activation function.
The second dense layer has 32 units and also uses the ReLU activation function.
The final dense layer has the same number of units as the number of actions (actions.shape[0]) and uses the softmax activation function. This layer represents the output layer, providing the probabilities of each action class.
* Model Compilation:
The optimizer is set to Adam.
The loss function is set to categorical cross-entropy, suitable for multi-class classification problems.
The metric used for evaluation is categorical accuracy, which measures the accuracy of predictions.

The training data X_train and corresponding labels y_train are provided as inputs.
The number of training epochs is set to 2000, but the training was stopped at 161th epoch. This was done as at this stage the model had reached a decent performance level (i.e 0.0473 loss) and beyond this the model would tend to perform bad due to overfitting.

### Evaluation Using Confusion Matrix and accuracy
This is the output for each of the three actions. It can be seen the model is working pretty well with very less number of false positives and false negatives.

![App Screenshot](https://github.com/AkGu2002/Real-Time-Sign-Language-Detection-LSTM/assets/74046369/70bd0bad-aafd-41da-b026-71aab906acb3)


The accuracy had reached 96.47%.

![App Screenshot](https://github.com/AkGu2002/Real-Time-Sign-Language-Detection-LSTM/assets/74046369/a793e7da-40ec-442f-a968-5c498258d871)

### Testing in Real Time
A threshold value is used to determine if a prediction is significant enough to be considered in forming the sentence.

After making detections and drawing landmarks, the code extracts the keypoints from the detected results and appends them to the sequence list. If the length of the sequence list reaches 30 (indicating 30 consecutive frames), the stored sequence is used for prediction using the pre-trained model.


The code checks if the last 10 predictions have the same label (indicating consistency).
If the consistency is observed and the highest predicted probability is above the defined threshold, the predicted label is considered for sentence formation.
If the sentence list is not empty and the current predicted label is different from the last one in the sentence, the label is added to the sentence list.
If the sentence list exceeds a length of 5, it is truncated to the last 5 elements.

The probabilities of the predicted actions are visualized using the prob_viz function, which overlays the probabilities on the frame using different colors.
The formed sentence is displayed at the top left corner of the frame using cv2.putText and is continuously updated as new actions are detected. A rectangle and text overlay are added at the top of the frame to display the formed sentence.

![App Screenshot](https://github.com/AkGu2002/Real-Time-Sign-Language-Detection-LSTM/assets/74046369/746dacc5-98a6-4158-91d6-ba2ca9b3206a)




