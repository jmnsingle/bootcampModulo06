import React, { Component } from 'react';
import {
  StatusBar,
  Keyboard,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PropTypes from 'prop-types';

import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  DeleteProfile,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Users',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    users: [],
    newUser: '',
    loading: false,
    msgError: '',
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  async componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    try {
      const { users, newUser } = this.state;
      this.setState({ loading: true });

      const response = await api.get(`/users/${newUser}`);
      const hasUser = users.find(repo => repo.name === response.data.name);

      if (newUser == '') {
        throw new Error('Invalid User');
      }

      if (hasUser) {
        throw new Error(' Duplicated');
      }

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      await this.setState({
        users: [...users, data],
        newUser: '',
        loading: false,
      });
      Keyboard.dismiss();
    } catch (error) {
      this.setState({
        loading: false,
        msgError: error.response
          ? `User ${error.response.data.message}`
          : `User${error.message}`,
      });
      alert(this.state.msgError);
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  handleDeleteProfile = async user => {
    alert(`Você irá deletar o usuário ${user.name}`);
    //  const { users } = this.state;

    //  const deleteUser = await users.splice(user, 1);

    //  console.log(deleteUser);
  };

  render() {
    const { users, newUser, loading } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorret={false}
            autoCapitalize="none"
            placeholder="Adicionar usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>
        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item, index }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <View style={{ flexDirection: 'row' }}>
                <ProfileButton onPress={() => this.handleNavigate(item)}>
                  <ProfileButtonText>Ver perfil</ProfileButtonText>
                </ProfileButton>
                <DeleteProfile onPress={() => this.handleDeleteProfile(item)}>
                  <Icon name="delete-forever" size={20} color="#FFF" />
                </DeleteProfile>
              </View>
            </User>
          )}
        />
      </Container>
    );
  }
}
